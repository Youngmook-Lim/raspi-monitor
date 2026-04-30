import type { StatsPayload } from '../types'
import { ArcGauge } from './gauges/ArcGauge'
import { tempColHex } from '../utils/colors'

interface Props { data: StatsPayload }

export function TempCard({ data }: Props) {
  const t = data.cpu.temp
  return (
    <div className="card card-t">
      <div className="card-label">TEMPERATURE <span className="card-label-blink">█</span></div>
      <ArcGauge value={t} min={30} max={90} color={tempColHex(t)} size={132} />
      <div style={{ textAlign: 'center', marginTop: '8px', fontSize: '10px', color: 'var(--dim)' }}>
        SoC · <span style={{ color: tempColHex(t) }}>●</span> {data.cpu.freq} MHz
      </div>
    </div>
  )
}
