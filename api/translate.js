import { json, readJson, sendJson } from '../server/http.js'
import { buildMessages } from '../server/prompt.js'
import { checkRateLimit } from '../server/rateLimit.js'
import { validateInput, validateResults } from '../server/validation.js'

export const config = { maxDuration: 30 }

function providerConfig() {
  const apiKey = process.env.DEEPSEEK_API_KEY || process.env.AI_API_KEY
  const baseUrl = (process.env.DEEPSEEK_BASE_URL || process.env.AI_BASE_URL || 'https://api.deepseek.com').replace(/\/$/, '')
  const model = process.env.DEEPSEEK_MODEL || process.env.AI_MODEL || 'deepseek-v4-flash'
  return { apiKey, baseUrl, model }
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

async function callProvider(input, provider) {
  let lastError

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 24_000)

    try {
      const requestBody = {
        model: provider.model,
        messages: buildMessages(input),
        response_format: { type: 'json_object' },
        temperature: 0.35,
        max_tokens: 1000,
        stream: false,
      }
      if (provider.baseUrl.includes('deepseek.com') || provider.model.startsWith('deepseek-')) {
        requestBody.thinking = { type: 'disabled' }
      }

      const response = await fetch(`${provider.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          authorization: `Bearer ${provider.apiKey}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify(requestBody),
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
    } catch (error) {
      lastError = error
      const retryable = error.name === 'AbortError' || error.retryable
      if (!retryable || attempt === 1) break
      await new Promise((resolve) => setTimeout(resolve, 250))
    } finally {
      clearTimeout(timeout)
    }
  }

  throw lastError
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
