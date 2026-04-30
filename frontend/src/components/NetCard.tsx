import { useState } from 'react'
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

interface NetHover { rx: number; svgW: number }

function NetSparkline({ vals, color, gradId }: SparkProps) {
  const [hover, setHover] = useState<NetHover | null>(null)

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
    setHover({ rx, svgW: rect.width })
  }

  const snap = hover ? (() => {
    const mouseX = hover.rx * W
    const leftX = W - (vals.length - 1) * STEP
    const idx = clamp(Math.round((mouseX - leftX) / STEP), 0, vals.length - 1)
    const [x, y] = pts[idx]
    return { x, y, val: vals[idx], secsAgo: Math.round((vals.length - 1 - idx) * (POLL_MS / 1000)) }
  })() : null

  const dotScreenX = snap && hover ? snap.x * (hover.svgW / W) : 0
  const dotScreenY = snap ? snap.y : 0  // viewBox H === CSS px height, so scale = 1

  return (
    <div style={{ position: 'relative' }}>
      {snap && (
        <div style={{
          position: 'absolute', top: 0, right: 0,
          fontSize: '9px', color, letterSpacing: '0.08em',
          pointerEvents: 'none', zIndex: 1,
        }}>
          {fmtBytes(snap.val)}/s · {snap.secsAgo}s ago
        </div>
      )}
      <svg
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
        {snap && (
          <line x1={snap.x} y1={0} x2={snap.x} y2={H}
            stroke="rgba(167,139,250,0.3)" strokeWidth="1" strokeDasharray="3,3" />
        )}
      </svg>
      {snap && (
        <div style={{
          position: 'absolute', pointerEvents: 'none',
          left: `${dotScreenX}px`, top: `${dotScreenY}px`,
          width: '7px', height: '7px', borderRadius: '50%',
          background: color, boxShadow: `0 0 5px ${color}`,
          transform: 'translate(-50%, -50%)',
        }} />
      )}
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
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', marginBottom: '3px' }}>
          <span style={{ color: 'var(--dim)' }}>▼ RX</span>
          <span style={{ color: 'var(--green)' }}>{fmtBytes(data.network.rx_bps)}/s</span>
        </div>
        <NetSparkline vals={rxH} color="#a78bfa" gradId="rxGrad" />
      </div>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', marginBottom: '3px' }}>
          <span style={{ color: 'var(--dim)' }}>▲ TX</span>
          <span style={{ color: '#c084fc' }}>{fmtBytes(data.network.tx_bps)}/s</span>
        </div>
        <NetSparkline vals={txH} color="#c084fc" gradId="txGrad" />
      </div>
    </div>
  )
}
