import { json, readJson } from './lib/http.js'
import { buildMessages } from './lib/prompt.js'
import { checkRateLimit } from './lib/rateLimit.js'
import { validateInput, validateResults } from './lib/validation.js'

export const config = { maxDuration: 30 }

function providerConfig() {
  const apiKey = process.env.DEEPSEEK_API_KEY || process.env.AI_API_KEY
  const baseUrl = (process.env.DEEPSEEK_BASE_URL || process.env.AI_BASE_URL || 'https://api.deepseek.com').replace(/\/$/, '')
  const model = process.env.DEEPSEEK_MODEL || process.env.AI_MODEL || 'deepseek-chat'
  return { apiKey, baseUrl, model }
}

function parseProviderContent(content) {
  const cleaned = String(content || '').trim().replace(/^```json\s*/i, '').replace(/\s*```$/, '')
  return validateResults(JSON.parse(cleaned))
}

async function callProvider(input, provider) {
  let lastError

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 24_000)

    try {
      const response = await fetch(`${provider.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          authorization: `Bearer ${provider.apiKey}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: provider.model,
          messages: buildMessages(input),
          response_format: { type: 'json_object' },
          temperature: 0.65,
          max_tokens: 700,
          stream: false,
        }),
        signal: controller.signal,
      })

      if (!response.ok) {
        const detail = await response.text()
        const error = new Error(`AI provider ${response.status}: ${detail.slice(0, 160)}`)
        error.retryable = response.status >= 500 || response.status === 429
        throw error
      }

      const payload = await response.json()
      const results = parseProviderContent(payload.choices?.[0]?.message?.content)
      if (!results) throw new Error('AI 返回内容不完整')
      return results
    } catch (error) {
      lastError = error
      const retryable = error.name === 'AbortError' || error.retryable || error.message.includes('不完整')
      if (!retryable || attempt === 1) break
      await new Promise((resolve) => setTimeout(resolve, 250))
    } finally {
      clearTimeout(timeout)
    }
  }

  throw lastError
}

export default async function handler(request) {
  if (request.method !== 'POST') {
    return json({ message: '只接受 POST 请求。' }, 405, { allow: 'POST' })
  }

  const rate = checkRateLimit(request)
  if (!rate.allowed) {
    return json(
      { message: '你今天有点急。十分钟后再来。' },
      429,
      { 'retry-after': String(rate.retryAfter) },
    )
  }

  const validation = validateInput(await readJson(request))
  if (validation.error) return json({ message: validation.error }, 400)

  const provider = providerConfig()
  if (!provider.apiKey) {
    return json({ message: 'AI 还没接电。请先配置 DEEPSEEK_API_KEY。' }, 503)
  }

  try {
    const results = await callProvider(validation.value, provider)
    return json({ results })
  } catch (error) {
    const timeout = error?.name === 'AbortError'
    return json(
      { message: timeout ? 'AI 想太久了。你先别急，再试一次。' : '这句话没抢救回来，再试一次。' },
      timeout ? 504 : 502,
    )
  }
}
