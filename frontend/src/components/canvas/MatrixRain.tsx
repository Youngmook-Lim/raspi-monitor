import { useEffect, useRef } from 'react'
import type { Theme } from '../../hooks/useTheme'

const CHARS = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF<>{}[]|\\'
const FS = 12

const COLORS = {
  dark:  { bg: 'rgba(9,7,15,0.14)',      lead: '#ede0ff',              shadow: '#a78bfa', trail: 'rgba(167,139,250,0.78)' },
  light: { bg: 'rgba(244,240,255,0.18)', lead: '#3b0764',              shadow: '#7c3aed', trail: 'rgba(124,58,237,0.72)'  },
}

interface Props { theme: Theme }

export function MatrixRain({ theme }: Props) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const cv = ref.current
    if (!cv) return
    const ctx = cv.getContext('2d')!
    let w: number, h: number, cols: number, drops: number[]

    const init = () => {
      w = cv.width = cv.offsetWidth
      h = cv.height = cv.offsetHeight
      cols = Math.floor(w / FS)
      drops = Array.from({ length: cols }, () => -Math.random() * 60)
      ctx.font = `${FS}px 'JetBrains Mono', monospace`
    }
    init()

    const c = COLORS[theme]
    let animId: number
    const draw = () => {
      ctx.fillStyle = c.bg
      ctx.fillRect(0, 0, w, h)
      ctx.shadowBlur = 0
      for (let i = 0; i < cols; i++) {
        const y = drops[i] * FS
        const ch = CHARS[Math.floor(Math.random() * CHARS.length)]
        if (y > 0 && y < h) {
          ctx.fillStyle = c.lead
          ctx.shadowColor = c.shadow
          ctx.shadowBlur = 10
          ctx.fillText(ch, i * FS, y)
          ctx.shadowBlur = 0
          if (y - FS > 0) {
            ctx.fillStyle = c.trail
            ctx.fillText(CHARS[Math.floor(Math.random() * CHARS.length)], i * FS, y - FS)
          }
        }
        if (y > h && Math.random() > 0.972) drops[i] = 0
        else drops[i] += 0.55
      }
      animId = requestAnimationFrame(draw)
    }
    animId = requestAnimationFrame(draw)

    const ro = new ResizeObserver(init)
    ro.observe(cv)
    return () => {
      cancelAnimationFrame(animId)
      ro.disconnect()
    }
  }, [theme])

  return (
    <canvas
      ref={ref}
      style={{ width: '100%', height: '100%', minHeight: '150px', display: 'block' }}
    />
  )
}
