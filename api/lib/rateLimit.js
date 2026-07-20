const WINDOW_MS = 10 * 60 * 1000
const MAX_REQUESTS = 8
const buckets = globalThis.__translationRateBuckets || new Map()
globalThis.__translationRateBuckets = buckets

function clientKey(request) {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
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
