import { useState } from 'react'
import type { StatsPayload } from '../types'
import { RingGauge } from './gauges/RingGauge'
import { cpuColHex, clamp } from '../utils/colors'

const POLL_MS = 2000
const W = 400, H = 64, SVG_H = 62
const HIST_LEN = 60
const STEP = W / (HIST_LEN - 1)

interface HistoryChartProps {
  history: StatsPayload[]
}

interface CpuHover { rx: number; svgW: number }

function CpuHistoryChart({ history }: HistoryChartProps) {
  const [hover, setHover] = useState<CpuHover | null>(null)

  if (history.length === 0) return null

  const vals = history.map(h => h.cpu?.total ?? 0)
  const pts = vals.map((v, i) => [
    W - (vals.length - 1 - i) * STEP,
    H - clamp(v / 100, 0, 1) * (H - 10) - 5,
  ])
  const linePath = pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
  const areaPath = `${linePath} L${W},${H} L${pts[0][0].toFixed(1)},${H} Z`

  const onMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const rx = clamp((e.clientX - rect.left) / rect.width, 0, 1)
    setHover({ rx, svgW: rect.width })
  }

  // Derive snapped point from current data on every render so the crosshair
  // follows the leftmost as new history arrives.
  const snap = hover ? (() => {
    const mouseX = hover.rx * W
    const leftX = W - (vals.length - 1) * STEP
    const idx = clamp(Math.round((mouseX - leftX) / STEP), 0, vals.length - 1)
    const [x, y] = pts[idx]
    return { x, y, pct: vals[idx], secsAgo: Math.round((vals.length - 1 - idx) * (POLL_MS / 1000)) }
  })() : null

  const dotCol = snap ? cpuColHex(snap.pct) : '#a78bfa'
  const dotScreenX = snap && hover ? snap.x * (hover.svgW / W) : 0
  const dotScreenY = snap ? snap.y * (SVG_H / H) : 0

  return (
    <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
      <div style={{
        fontSize: '8px', color: 'var(--dim)', letterSpacing: '0.1em', marginBottom: '6px',
        display: 'flex', justifyContent: 'space-between',
      }}>
        <span>CPU HISTORY <span style={{ color: 'var(--dim2)' }}>· 60s</span></span>
        {snap
          ? <span style={{ color: dotCol, transition: 'color 0.2s' }}>{snap.pct.toFixed(1)}% · {snap.secsAgo}s ago</span>
          : <span style={{ color: 'var(--dim2)' }}>hover to inspect</span>
        }
      </div>
      <div style={{ position: 'relative' }}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          style={{ width: '100%', height: `${SVG_H}px`, display: 'block', overflow: 'visible', cursor: 'crosshair' }}
          onMouseMove={onMove}
          onMouseLeave={() => setHover(null)}
        >
          <defs>
            <linearGradient id="cpuHistGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#a78bfa" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[25, 50, 75].map(g => {
            const gy = H - (g / 100) * (H - 10) - 5
            return (
              <line key={g} x1={0} y1={gy} x2={W} y2={gy}
                stroke="rgba(139,108,240,0.07)" strokeWidth="1" strokeDasharray="4,4" />
            )
          })}
          <path d={areaPath} fill="url(#cpuHistGrad)" />
          <path d={linePath} fill="none" stroke="#a78bfa" strokeWidth="1.5"
            style={{ filter: 'drop-shadow(0 0 3px rgba(167,139,250,0.5))' }} />
          {snap && (
            <line x1={snap.x} y1={0} x2={snap.x} y2={H}
              stroke="rgba(167,139,250,0.3)" strokeWidth="1" strokeDasharray="3,3" />
          )}
        </svg>
        {[25, 50, 75].map(g => {
          const gy = H - (g / 100) * (H - 10) - 5
          const topPx = gy * (SVG_H / H) - 3
          return (
            <div key={g} style={{
              position: 'absolute', right: '2px', top: `${topPx}px`,
              transform: 'translateY(-100%)',
              fontSize: '7px', fontFamily: 'JetBrains Mono',
              color: 'rgba(139,108,240,0.28)',
              pointerEvents: 'none', lineHeight: 1,
            }}>{g}%</div>
          )
        })}
        {snap && (
          <>
            <div style={{
              position: 'absolute', pointerEvents: 'none',
              left: `${dotScreenX}px`, top: `${dotScreenY}px`,
              width: '16px', height: '16px', borderRadius: '50%',
              border: `1px solid ${dotCol}`, opacity: 0.3,
              transform: 'translate(-50%, -50%)',
            }} />
            <div style={{
              position: 'absolute', pointerEvents: 'none',
              left: `${dotScreenX}px`, top: `${dotScreenY}px`,
              width: '7px', height: '7px', borderRadius: '50%',
              background: dotCol, boxShadow: `0 0 5px ${dotCol}`,
              transform: 'translate(-50%, -50%)',
            }} />
          </>
        )}
      </div>
    </div>
  )
}

interface Props {
  data: StatsPayload
  history: StatsPayload[]
}

export function CpuCard({ data, history }: Props) {
  const { total, cores, freq, governor } = data.cpu

  return (
    <div className="card card-c card-pulse">
      <div className="card-label">CPU <span className="card-label-blink">█</span></div>
      <div style={{ display: 'flex', gap: '14px', alignItems: 'center', marginBottom: '14px' }}>
        <RingGauge value={total} color={cpuColHex(total)} label="TOTAL" sub={`${freq} MHz`} size={108} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '8px', color: 'var(--dim)', letterSpacing: '0.1em', marginBottom: '8px' }}>
            PER-CORE UTILISATION
          </div>
          {cores.map((c, i) => (
            <div key={i} style={{ marginBottom: '9px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', marginBottom: '3px' }}>
                <span style={{ color: 'var(--dim)' }}>CORE{i}</span>
                <span style={{ color: cpuColHex(c), transition: 'color 0.5s' }}>{c.toFixed(1)}%</span>
              </div>
              <div className="bar-track">
                <div className="bar-fill" style={{
                  width: `${c}%`,
                  background: cpuColHex(c),
                  boxShadow: `0 0 6px ${cpuColHex(c)}`,
                }} />
              </div>
            </div>
          ))}
          <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
            <div className="stat-pill" style={{ flex: 1 }}>
              <span className="stat-pill-k">GOVERNOR</span>
              <span className="stat-pill-v" style={{ fontSize: '10px' }}>{governor}</span>
            </div>
            <div className="stat-pill" style={{ flex: 1 }}>
              <span className="stat-pill-k">CORES</span>
              <span className="stat-pill-v">{cores.length}</span>
            </div>
          </div>
        </div>
      </div>
      <CpuHistoryChart history={history} />
    </div>
  )
}
