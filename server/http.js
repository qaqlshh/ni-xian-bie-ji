export function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      ...extraHeaders,
    },
  })
}

export function sendJson(response, data, status = 200, extraHeaders = {}) {
  response.statusCode = status
  response.setHeader('content-type', 'application/json; charset=utf-8')
  response.setHeader('cache-control', 'no-store')
  Object.entries(extraHeaders).forEach(([key, value]) => response.setHeader(key, value))
  response.end(JSON.stringify(data))
}

export async function readJson(request) {
  if (typeof request.json === 'function') {
    try {
      return await request.json()
    } catch {
      return null
    }
  }

  if (request.body && typeof request.body === 'object' && !Buffer.isBuffer(request.body)) {
    return request.body
  }

  try {
    const chunks = []
    for await (const chunk of request) chunks.push(Buffer.from(chunk))
    return JSON.parse(Buffer.concat(chunks).toString('utf8'))
  } catch {
    return null
  }
}
