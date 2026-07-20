const guardedActions = [
  { pattern: /重做|重新(?:做|修改|改|调整|考虑|检查)/, label: '新增了重做或重新处理的要求' },
  { pattern: /(?:先|再|记得)(?:看|检查|想|考虑|改|调整)(?:看|一下)?/, label: '新增了检查或修改的要求' },
  { pattern: /给(?:我)?个(?:准话|说法|答复)|告诉我|回复我|回应我/, label: '新增了要求对方回应的压力' },
  { pattern: /向我道歉|给我道歉/, label: '新增了要求对方道歉的要求' },
]

export function findContentViolations(original, results) {
  const issues = []

  for (const [variant, result] of Object.entries(results)) {
    for (const action of guardedActions) {
      const match = result.match(action.pattern)?.[0]
      if (match && !original.includes(match)) {
        issues.push(`${variant}：“${match}”${action.label}`)
      }
    }
  }

  return issues
}
