import { useEffect, useRef } from 'react'
import { hex2rgba } from '../../utils/colors'
import { clamp } from '../../utils/colors'

interface Props {
  data: number[]
  color?: string
  h?: number
}

export function Sparkline({ data, color = '#a78bfa', h = 38 }: Props) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const cv = ref.current
    if (!cv || !data.length) return
    const ctx = cv.getContext('2d')!
    const w = (cv.width = cv.offsetWidth)
    cv.height = h
    const max = Math.max(...data, 1)
    const pts = data.map((v, i) => [
      (i / (data.length - 1)) * w,
      h - clamp(v / max, 0, 1) * (h - 6) - 3,
    ])
    ctx.clearRect(0, 0, w, h)

    const grad = ctx.createLinearGradient(0, 0, 0, h)
    grad.addColorStop(0, hex2rgba(color, 0.28))
    grad.addColorStop(1, hex2rgba(color, 0))
    ctx.beginPath()
    pts.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)))
    ctx.lineTo(w, h)
    ctx.lineTo(0, h)
    ctx.closePath()
    ctx.fillStyle = grad
    ctx.fill()

    ctx.beginPath()
    pts.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)))
    ctx.strokeStyle = color
    ctx.lineWidth = 1.5
    ctx.shadowColor = color
    ctx.shadowBlur = 5
    ctx.stroke()
    ctx.shadowBlur = 0
  }, [data, color, h])

  return <canvas ref={ref} style={{ width: '100%', height: `${h}px`, display: 'block' }} />
}
