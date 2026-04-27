import type { StatsPayload } from '../types'
import { Sparkline } from './canvas/Sparkline'
import { fmtBytes } from '../utils/format'

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
        NETWORK · {data.network.iface} <span className="card-label-blink">█</span>
      </div>
      <div style={{ marginBottom: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '8.5px', marginBottom: '3px' }}>
          <span style={{ color: 'var(--dim)' }}>▼ RX</span>
          <span style={{ color: 'var(--green)' }}>{fmtBytes(data.network.rx_bps)}/s</span>
        </div>
        <Sparkline data={rxH} color="#a78bfa" h={36} />
      </div>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '8.5px', marginBottom: '3px' }}>
          <span style={{ color: 'var(--dim)' }}>▲ TX</span>
          <span style={{ color: '#c084fc' }}>{fmtBytes(data.network.tx_bps)}/s</span>
        </div>
        <Sparkline data={txH} color="#c084fc" h={36} />
      </div>
    </div>
  )
}
