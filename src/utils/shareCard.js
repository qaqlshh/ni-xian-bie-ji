function wrapText(context, text, maxWidth) {
  const lines = []
  let current = ''
  for (const char of Array.from(text)) {
    const candidate = current + char
    if (context.measureText(candidate).width > maxWidth && current) {
      lines.push(current)
      current = char
    } else {
      current = candidate
    }
  }
  if (current) lines.push(current)
  return lines
}

function drawLines(context, lines, x, y, lineHeight, maxLines = 8) {
  lines.slice(0, maxLines).forEach((line, index) => context.fillText(line, x, y + index * lineHeight))
  return y + Math.min(lines.length, maxLines) * lineHeight
}

export async function downloadShareCard({ original, result, label }) {
  const canvas = document.createElement('canvas')
  canvas.width = 1080
  canvas.height = 1440
  const context = canvas.getContext('2d')
  if (!context) throw new Error('当前浏览器不支持生成分享图')

  const gradient = context.createLinearGradient(0, 0, 1080, 1440)
  gradient.addColorStop(0, '#f8f1e7')
  gradient.addColorStop(1, '#ead9c9')
  context.fillStyle = gradient
  context.fillRect(0, 0, 1080, 1440)

  context.fillStyle = '#bd3827'
  context.beginPath()
  context.roundRect(76, 70, 82, 82, 24)
  context.fill()
  context.fillStyle = '#fffaf3'
  context.font = '700 44px "Noto Serif SC", serif'
  context.textAlign = 'center'
  context.fillText('急', 117, 126)

  context.textAlign = 'left'
  context.fillStyle = '#28201a'
  context.font = '900 62px "Noto Serif SC", serif'
  context.fillText('你先别急', 182, 126)
  context.fillStyle = '#897a6e'
  context.font = '500 25px "Noto Sans SC", sans-serif'
  context.fillText('急急翻译器 / 发送前抢救记录', 76, 192)

  context.fillStyle = 'rgba(255, 253, 249, 0.8)'
  context.beginPath()
  context.roundRect(76, 252, 928, 280, 34)
  context.fill()
  context.fillStyle = '#a39589'
  context.font = '700 24px "Noto Sans SC", sans-serif'
  context.fillText('原话', 120, 308)
  context.fillStyle = '#594d43'
  context.font = '500 34px "Noto Sans SC", sans-serif'
  drawLines(context, wrapText(context, original, 840), 120, 370, 54, 3)

  context.fillStyle = '#bd3827'
  context.font = '800 26px "Noto Sans SC", sans-serif'
  context.fillText(label, 84, 620)
  context.fillStyle = '#fffdf9'
  context.beginPath()
  context.roundRect(76, 654, 928, 540, 38)
  context.fill()
  context.fillStyle = '#28201a'
  context.font = '700 42px "Noto Sans SC", sans-serif'
  drawLines(context, wrapText(context, result, 820), 126, 740, 68, 6)

  context.fillStyle = '#897a6e'
  context.font = '500 24px "Noto Sans SC", sans-serif'
  context.fillText('话可以难听一点，别把事情说坏。', 76, 1305)
  context.textAlign = 'right'
  context.fillText('ni-xian-bie-ji', 1004, 1305)

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png', 0.95))
  if (!blob) throw new Error('分享图生成失败')
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `你先别急-${Date.now()}.png`
  link.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 500)
}
