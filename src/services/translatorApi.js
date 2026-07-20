const DEFAULT_TIMEOUT = 32_000

export async function requestTranslation(payload, options = {}) {
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), options.timeout || DEFAULT_TIMEOUT)

  try {
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    })
    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      const error = new Error(data.message || '这句话抢救失败了，稍后再试一次。')
      error.status = response.status
      throw error
    }

    return data.results
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('AI 想太久了。你先别急，再试一次。')
    }
    if (error instanceof TypeError) {
      throw new Error('网络没接上。这次真不是你的表达问题。')
    }
    throw error
  } finally {
    window.clearTimeout(timeout)
  }
}
