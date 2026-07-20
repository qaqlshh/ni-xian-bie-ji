import assert from 'node:assert/strict'
import test from 'node:test'
import handler from '../api/translate.js'

test('rejects methods other than POST', async () => {
  const response = await handler(new Request('http://localhost/api/translate', { method: 'GET' }))
  assert.equal(response.status, 405)
  assert.equal(response.headers.get('cache-control'), 'no-store')
})

test('rejects invalid JSON input', async () => {
  const response = await handler(new Request('http://localhost/api/translate', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-forwarded-for': 'test-invalid' },
    body: '{',
  }))
  assert.equal(response.status, 400)
})

test('reports missing provider configuration without leaking input', async () => {
  const previousKey = process.env.DEEPSEEK_API_KEY
  const previousFallback = process.env.AI_API_KEY
  delete process.env.DEEPSEEK_API_KEY
  delete process.env.AI_API_KEY

  try {
    const response = await handler(new Request('http://localhost/api/translate', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-forwarded-for': 'test-no-key' },
      body: JSON.stringify({ text: '这件事到底还做不做？', relation: '甲方', intent: '说清楚', fire: 50 }),
    }))
    const payload = await response.json()
    assert.equal(response.status, 503)
    assert.equal(JSON.stringify(payload).includes('这件事到底还做不做'), false)
  } finally {
    if (previousKey) process.env.DEEPSEEK_API_KEY = previousKey
    if (previousFallback) process.env.AI_API_KEY = previousFallback
  }
})
