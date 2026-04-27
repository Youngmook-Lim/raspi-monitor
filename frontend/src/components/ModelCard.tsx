import type { StatsPayload } from '../types'
import { fmtUptime } from '../utils/format'

interface Props { data: StatsPayload }

const API_URL = '/api/stream'

export function ModelCard({ data }: Props) {
  const rows: [string, string][] = [
    ['MODEL',  data.model],
    ['OS',     data.os],
    ['KERNEL', data.kernel],
    ['UPTIME', fmtUptime(data.uptime)],
  ]

  return (
    <div className="card card-m">
      <div className="card-label">SYSTEM INFO <span className="card-label-blink">█</span></div>
      {rows.map(([k, v]) => (
        <div key={k} style={{ marginBottom: '9px' }}>
          <div style={{ fontSize: '7.5px', color: 'var(--dim)', letterSpacing: '0.12em', marginBottom: '2px' }}>
            {k}
          </div>
          <div style={{ fontSize: '9.5px', color: 'var(--text)', lineHeight: 1.45, wordBreak: 'break-all' }}>
            {v}
          </div>
        </div>
      ))}
      <div style={{
        marginTop: '8px', padding: '6px 8px',
        background: 'rgba(192,132,252,0.05)',
        border: '1px solid rgba(192,132,252,0.2)',
        borderRadius: '2px',
      }}>
        <div style={{ fontSize: '7.5px', color: 'rgba(192,132,252,0.5)', marginBottom: '2px', letterSpacing: '0.1em' }}>
          SSE ENDPOINT
        </div>
        <div style={{ fontSize: '9px', color: '#c084fc', wordBreak: 'break-all' }}>{API_URL}</div>
      </div>
    </div>
  )
}
