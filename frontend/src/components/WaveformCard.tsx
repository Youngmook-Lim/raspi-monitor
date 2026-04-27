import type { StatsPayload } from '../types'
import { Oscilloscope } from './canvas/Oscilloscope'

interface Props { data: StatsPayload }

export function WaveformCard({ data }: Props) {
  return (
    <div className="card card-w" style={{ padding: '14px', display: 'flex', flexDirection: 'column' }}>
      <div className="card-label">// WAVEFORM · SYS ACTIVITY <span className="card-label-blink">█</span></div>
      <div style={{ flex: 1, minHeight: '150px', overflow: 'hidden' }}>
        <Oscilloscope data={data} />
      </div>
    </div>
  )
}
