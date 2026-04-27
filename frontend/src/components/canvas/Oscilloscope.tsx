import { useEffect, useRef } from 'react'
import type { StatsPayload } from '../../types'
import { clamp } from '../../utils/colors'

interface Props {
  data: StatsPayload
}

const WAVES = [
  { f: 0.9, ph: 0,   col: '#a78bfa', lw: 1.8, alpha: 0.9  },
  { f: 2.3, ph: 1.4, col: '#f472b6', lw: 1.4, alpha: 0.65 },
  { f: 0.4, ph: 2.8, col: '#c084fc', lw: 1.2, alpha: 0.4  },
  { f: 5.1, ph: 0.5, col: '#818cf8', lw: 1.0, alpha: 0.22 },
]

export function Oscilloscope({ data }: Props) {
  const ref = useRef<HTMLCanvasElement>(null)
  const t0 = useRef(Date.now())
  const cpuAmp = clamp((data?.cpu?.total ?? 40) / 100, 0.05, 0.45)
  const netAmp = clamp((data?.network?.rx_bps ?? 200000) / (4 * 1024 ** 2), 0.03, 0.25)

  useEffect(() => {
    const cv = ref.current
    if (!cv) return
    let animId: number

    const draw = () => {
      const w = (cv.width = cv.offsetWidth)
      const h = (cv.height = cv.offsetHeight)
      const t = (Date.now() - t0.current) / 1000
      const ctx = cv.getContext('2d')!
      ctx.clearRect(0, 0, w, h)

      ctx.strokeStyle = 'rgba(139,108,240,0.07)'
      ctx.lineWidth = 1
      for (let i = 1; i < 4; i++) {
        ctx.beginPath(); ctx.moveTo(0, h * i / 4); ctx.lineTo(w, h * i / 4); ctx.stroke()
      }
      for (let i = 1; i < 8; i++) {
        ctx.beginPath(); ctx.moveTo(w * i / 8, 0); ctx.lineTo(w * i / 8, h); ctx.stroke()
      }

      const amps = [cpuAmp, netAmp, 0.18, 0.055]
      WAVES.forEach((wv, wi) => {
        const a = amps[wi]
        ctx.beginPath()
        for (let x = 0; x <= w; x += 2) {
          const nx = x / w
          const y =
            h / 2 +
            Math.sin(nx * Math.PI * 6 * wv.f + t * wv.f * 1.1 + wv.ph) * h * a +
            Math.sin(nx * Math.PI * 14 * wv.f + t * 0.6 + wv.ph * 1.7) * h * a * 0.3
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
        }
        ctx.strokeStyle = wv.col
        ctx.lineWidth = wv.lw
        ctx.globalAlpha = wv.alpha
        ctx.shadowColor = wv.col
        ctx.shadowBlur = wv.lw > 1.5 ? 6 : 0
        ctx.stroke()
      })
      ctx.globalAlpha = 1
      ctx.shadowBlur = 0
      animId = requestAnimationFrame(draw)
    }
    animId = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(animId)
  }, [cpuAmp, netAmp])

  return (
    <canvas
      ref={ref}
      style={{ width: '100%', height: '100%', minHeight: '150px', display: 'block' }}
    />
  )
}
