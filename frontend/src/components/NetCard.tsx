import { useState, useRef, useEffect } from 'react'
import type { StatsPayload } from '../types'
import { fmtBytes } from '../utils/format'
import { clamp } from '../utils/colors'

const POLL_MS = 2000
const W = 400, H = 36
const HIST_LEN = 60
const STEP = W / (HIST_LEN - 1)

interface SparkProps {
  vals: number[]
  color: string
  gradId: string
}

function NetSparkline({ vals, color, gradId }: SparkProps) {
  const [hover, setHover] = useState<{ mouseX: number; x: number; y: number; val: number; secsAgo: number } | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const [svgW, setSvgW] = useState(W)

  useEffect(() => {
    const el = svgRef.current
    if (!el) return
    const ro = new ResizeObserver(() => setSvgW(el.getBoundingClientRect().width))
    ro.observe(el)
    setSvgW(el.getBoundingClientRect().width)
    return () => ro.disconnect()
  }, [])

  if (vals.length === 0) return <div style={{ height: `${H}px` }} />

  const max = Math.max(...vals, 1)
  const pts = vals.map((v, i) => [
    W - (vals.length - 1 - i) * STEP,
    H - clamp(v / max, 0, 1) * (H - 6) - 3,
  ])
  const linePath = pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
  const areaPath = `${linePath} L${W},${H} L${pts[0][0].toFixed(1)},${H} Z`

  const onMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const rx = clamp((e.clientX - rect.left) / rect.width, 0, 1)
    const mouseX = rx * W
    const leftX = W - (vals.length - 1) * STEP
    const idx = clamp(Math.round((mouseX - leftX) / STEP), 0, vals.length - 1)
    const [hx, hy] = pts[idx]
    const secsAgo = Math.round((vals.length - 1 - idx) * (POLL_MS / 1000))
    setHover({ mouseX, x: hx, y: hy, val: vals[idx], secsAgo })
  }

  const scaleX = svgW / W, scaleY = H / H  // scaleY=1 since CSS height matches viewBox H
  const dotRx = 3.5 / scaleX, dotRy = 3.5 / scaleY

  return (
    <div style={{ position: 'relative' }}>
      {hover && (
        <div style={{
          position: 'absolute', top: 0, right: 0,
          fontSize: '8px', color, letterSpacing: '0.08em',
          pointerEvents: 'none', zIndex: 1,
        }}>
          {fmtBytes(hover.val)}/s · {hover.secsAgo}s ago
        </div>
      )}
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        style={{ width: '100%', height: `${H}px`, display: 'block', cursor: 'crosshair', overflow: 'visible' }}
        onMouseMove={onMove}
        onMouseLeave={() => setHover(null)}
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.28" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill={`url(#${gradId})`} />
        <path d={linePath} fill="none" stroke={color} strokeWidth="1.5"
          style={{ filter: `drop-shadow(0 0 3px ${color})` }} />
        {hover && (
          <>
            <line x1={hover.mouseX} y1={0} x2={hover.mouseX} y2={H}
              stroke="rgba(167,139,250,0.3)" strokeWidth="1" strokeDasharray="3,3" />
            <ellipse cx={hover.x} cy={hover.y} rx={dotRx} ry={dotRy} fill={color}
              style={{ filter: `drop-shadow(0 0 5px ${color})` }} />
          </>
        )}
      </svg>
    </div>
  )
}

interface Props {
  data: StatsPayload
  history: StatsPayload[]
}

export function NetCard({ data, history }: Props) {
  const rxH = history.map(h => h.network?.rx_bps ?? 0)
  const txH = history.map(h => h.network?.tx_bps ?? 0)

  return (
    <div className="card card-n">
      <div className="card-label">
        NETWORK · {data.network.iface.toUpperCase()} <span className="card-label-blink">█</span>
      </div>
      <div style={{ marginBottom: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '8.5px', marginBottom: '3px' }}>
          <span style={{ color: 'var(--dim)' }}>▼ RX</span>
          <span style={{ color: 'var(--green)' }}>{fmtBytes(data.network.rx_bps)}/s</span>
        </div>
        <NetSparkline vals={rxH} color="#a78bfa" gradId="rxGrad" />
      </div>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '8.5px', marginBottom: '3px' }}>
          <span style={{ color: 'var(--dim)' }}>▲ TX</span>
          <span style={{ color: '#c084fc' }}>{fmtBytes(data.network.tx_bps)}/s</span>
        </div>
        <NetSparkline vals={txH} color="#c084fc" gradId="txGrad" />
      </div>
    </div>
  )
}
