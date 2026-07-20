export const relationOptions = ['喜欢的人', '前任', '朋友', '领导', '甲方']

export const intentOptions = ['说清楚', '拒绝', '道歉', '发火']

export function fireLabel(value) {
  if (value <= 20) return '基本冷静'
  if (value <= 45) return '有点不爽'
  if (value <= 70) return '火气在线'
  return '别拦着我'
}
