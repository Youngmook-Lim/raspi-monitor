import type { StatsPayload } from '../types'
import { RingGauge } from './gauges/RingGauge'
import { cpuColHex } from '../utils/colors'
import { fmtBytes } from '../utils/format'

interface Props { data: StatsPayload }

export function DiskCard({ data }: Props) {
  const { total, used, read_bps, write_bps } = data.disk
  const pct = (used / total) * 100

  return (
    <div className="card card-d">
      <div className="card-label">DISK <span className="card-label-blink">█</span></div>
      <RingGauge value={pct} color={cpuColHex(pct)} label="USED" sub={`${fmtBytes(used)}/${fmtBytes(total)}`} size={100} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginTop: '12px' }}>
        <div className="stat-pill">
          <span className="stat-pill-k">READ/s</span>
          <span className="stat-pill-v" style={{ fontSize: '10px', color: 'var(--green)' }}>{fmtBytes(read_bps)}</span>
        </div>
        <div className="stat-pill">
          <span className="stat-pill-k">WRITE/s</span>
          <span className="stat-pill-v" style={{ fontSize: '10px', color: 'var(--yellow)' }}>{fmtBytes(write_bps)}</span>
        </div>
      </div>
    </div>
  )
}
