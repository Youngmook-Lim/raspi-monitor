import type { StatsPayload } from '../types'
import { cpuColHex } from '../utils/colors'
import { fmtBytes } from '../utils/format'

interface Props { data: StatsPayload }

export function RamCard({ data }: Props) {
  const { total, used, swap_total, swap_used } = data.memory
  const rPct = total > 0 ? (used / total) * 100 : 0
  const sPct = swap_total > 0 ? (swap_used / swap_total) * 100 : 0

  return (
    <div className="card card-r">
      <div className="card-label">MEMORY <span className="card-label-blink">█</span></div>
      <div style={{ marginBottom: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', marginBottom: '4px' }}>
          <span style={{ color: 'var(--dim)' }}>RAM</span>
          <span style={{ color: cpuColHex(rPct) }}>{fmtBytes(used)} / {fmtBytes(total)}</span>
        </div>
        <div className="bar-track" style={{ height: '10px' }}>
          <div className="bar-fill" style={{
            width: `${rPct}%`,
            background: cpuColHex(rPct),
            boxShadow: `0 0 8px ${cpuColHex(rPct)}`,
          }} />
        </div>
        <div style={{ textAlign: 'right', fontSize: '9px', color: 'var(--dim)', marginTop: '3px' }}>
          {rPct.toFixed(1)}%
        </div>
      </div>
      <div style={{ marginBottom: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', marginBottom: '4px' }}>
          <span style={{ color: 'var(--dim)' }}>SWAP</span>
          <span style={{ color: 'var(--purple)' }}>{fmtBytes(swap_used)} / {fmtBytes(swap_total)}</span>
        </div>
        <div className="bar-track" style={{ height: '7px' }}>
          <div className="bar-fill" style={{ width: `${sPct}%`, background: '#8b7cf8', boxShadow: '0 0 6px #8b7cf8' }} />
        </div>
        <div style={{ textAlign: 'right', fontSize: '9px', color: 'var(--dim)', marginTop: '3px' }}>
          {sPct.toFixed(1)}%
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
        <div className="stat-pill">
          <span className="stat-pill-k">FREE</span>
          <span className="stat-pill-v" style={{ fontSize: '10px' }}>{fmtBytes(total - used)}</span>
        </div>
        <div className="stat-pill">
          <span className="stat-pill-k">TOTAL</span>
          <span className="stat-pill-v" style={{ fontSize: '10px' }}>{fmtBytes(total)}</span>
        </div>
      </div>
    </div>
  )
}
