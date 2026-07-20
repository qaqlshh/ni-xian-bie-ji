const relations = new Set(['喜欢的人', '前任', '朋友', '领导', '甲方'])
const intents = new Set(['说清楚', '拒绝', '道歉', '发火'])

export function validateInput(value) {
  if (!value || typeof value !== 'object') return { error: '请求内容不对。' }

  const text = String(value.text || '').trim()
  const relation = String(value.relation || '').trim()
  const intent = String(value.intent || '').trim()
  const fire = Number(value.fire)

  if (Array.from(text).length < 2 || Array.from(text).length > 300) {
    return { error: '原话请控制在 2 到 300 个字。' }
  }
  if (!relations.has(relation)) return { error: '关系选项不对。' }
  if (!intents.has(intent)) return { error: '表达目的不对。' }
  if (!Number.isFinite(fire) || fire < 0 || fire > 100) return { error: '火气值不对。' }

  return { value: { text, relation, intent, fire: Math.round(fire / 10) * 10 } }
}

export function validateResults(value) {
  if (!value || typeof value !== 'object') return null
  const result = {}
  for (const key of ['gentle', 'direct', 'spicy']) {
    const text = typeof value[key] === 'string' ? value[key].trim() : value[key]?.text?.trim()
    if (!text || Array.from(text).length > 500) return null
    result[key] = text
  }
  if (new Set(Object.values(result)).size !== 3) return null
  return result
}
