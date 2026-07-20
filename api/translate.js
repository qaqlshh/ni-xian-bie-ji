import { json, readJson, sendJson } from '../server/http.js'
import { findContentViolations } from '../server/contentGuard.js'
import { buildMessages, buildRepairMessages, buildReviewMessages } from '../server/prompt.js'
import { checkRateLimit } from '../server/rateLimit.js'
import { validateInput, validateResults } from '../server/validation.js'

export const config = { maxDuration: 45 }

function providerConfig() {
  const apiKey = process.env.DEEPSEEK_API_KEY || process.env.AI_API_KEY
  const baseUrl = (process.env.DEEPSEEK_BASE_URL || process.env.AI_BASE_URL || 'https://api.deepseek.com').replace(/\/$/, '')
  const model = process.env.DEEPSEEK_MODEL || process.env.AI_MODEL || 'deepseek-v4-flash'
  const reviewModel = process.env.DEEPSEEK_REVIEW_MODEL
    || process.env.AI_REVIEW_MODEL
    || (baseUrl.includes('deepseek.com') ? 'deepseek-v4-pro' : model)
  return { apiKey, baseUrl, model, reviewModel }
}

function parseProviderContent(content) {
  try {
    const cleaned = String(content || '').trim().replace(/^```json\s*/i, '').replace(/\s*```$/, '')
    const parsed = JSON.parse(cleaned)
    const results = validateResults(parsed.results || parsed)
    if (!results) throw new Error('AI 返回的三个版本不完整')
    return results
  } catch {
    const error = new Error('AI 返回格式不对')
    error.retryable = true
    throw error
  }
}

function requestBody(provider, messages, { maxTokens, temperature }) {
  const body = {
    model: provider.model,
    messages,
    response_format: { type: 'json_object' },
    temperature,
    max_tokens: maxTokens,
    stream: false,
  }
  if (provider.baseUrl.includes('deepseek.com') || provider.model.startsWith('deepseek-')) {
    body.thinking = { type: 'disabled' }
  }
  return body
}

async function requestProvider(provider, messages, options) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs)

  try {
    const response = await fetch(`${provider.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${provider.apiKey}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify(requestBody(provider, messages, options)),
      signal: controller.signal,
    })

    if (!response.ok) {
      const detail = await response.text()
      const error = new Error(`AI provider ${response.status}: ${detail.slice(0, 160)}`)
      error.retryable = response.status >= 500 || response.status === 429
      throw error
    }

    const payload = await response.json()
    return parseProviderContent(payload.choices?.[0]?.message?.content)
  } finally {
    clearTimeout(timeout)
  }
}

async function withRetry(work, attempts) {
  let lastError

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      return await work()
    } catch (error) {
      lastError = error
      const retryable = error.name === 'AbortError' || error.retryable
      if (!retryable || attempt === attempts - 1) break
      await new Promise((resolve) => setTimeout(resolve, 250))
    }
  }

  throw lastError
}

async function callProvider(input, provider) {
  const draft = await withRetry(
    () => requestProvider(provider, buildMessages(input), {
      maxTokens: 1000,
      temperature: 0.35,
      timeoutMs: 10_000,
    }),
    2,
  )

  let reviewed
  try {
    reviewed = await requestProvider(
      { ...provider, model: provider.reviewModel },
      buildReviewMessages(input.text, draft), {
      maxTokens: 500,
      temperature: 0.1,
      timeoutMs: 12_000,
      },
    )
  } catch {
    return draft
  }

  const violations = findContentViolations(input.text, reviewed)
  if (violations.length === 0) return reviewed

  try {
    return await requestProvider(
      { ...provider, model: provider.reviewModel },
      buildRepairMessages(input.text, reviewed, violations), {
        maxTokens: 500,
        temperature: 0,
        timeoutMs: 8_000,
      },
    )
  } catch {
    return reviewed
  }
}

export default async function handler(request, response) {
  const respond = (data, status = 200, headers = {}) => response
    ? sendJson(response, data, status, headers)
    : json(data, status, headers)

  if (request.method !== 'POST') {
    return respond({ message: '只接受 POST 请求。' }, 405, { allow: 'POST' })
  }

  const rate = checkRateLimit(request)
  if (!rate.allowed) {
    return respond(
      { message: '你今天有点急。十分钟后再来。' },
      429,
      { 'retry-after': String(rate.retryAfter) },
    )
  }

  const validation = validateInput(await readJson(request))
  if (validation.error) return respond({ message: validation.error }, 400)

  const provider = providerConfig()
  if (!provider.apiKey) {
    return respond({ message: 'AI 还没接电。请先配置 DEEPSEEK_API_KEY。' }, 503)
  }

  try {
    const results = await callProvider(validation.value, provider)
    return respond({ results })
  } catch (error) {
    const timeout = error?.name === 'AbortError'
    return respond(
      { message: timeout ? 'AI 想太久了。你先别急，再试一次。' : '这句话没抢救回来，再试一次。' },
      timeout ? 504 : 502,
    )
  }
}
