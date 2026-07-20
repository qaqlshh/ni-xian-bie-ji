const WINDOW_MS = 10 * 60 * 1000
const MAX_REQUESTS = 8
const buckets = globalThis.__translationRateBuckets || new Map()
globalThis.__translationRateBuckets = buckets

function header(request, name) {
  if (typeof request.headers?.get === 'function') return request.headers.get(name)
  const value = request.headers?.[name] || request.headers?.[name.toLowerCase()]
  return Array.isArray(value) ? value[0] : value
}

function clientKey(request) {
  return header(request, 'x-forwarded-for')?.split(',')[0]?.trim()
    || header(request, 'x-real-ip')
    || request.socket?.remoteAddress
    || 'unknown'
}

export function checkRateLimit(request) {
  const now = Date.now()
  const key = clientKey(request)
  const recent = (buckets.get(key) || []).filter((timestamp) => now - timestamp < WINDOW_MS)

  if (recent.length >= MAX_REQUESTS) {
    const retryAfter = Math.max(1, Math.ceil((WINDOW_MS - (now - recent[0])) / 1000))
    buckets.set(key, recent)
    return { allowed: false, retryAfter }
  }

  recent.push(now)
  buckets.set(key, recent)
  return { allowed: true, remaining: MAX_REQUESTS - recent.length }
}
