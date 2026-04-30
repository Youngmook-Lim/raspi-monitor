import type { StatsPayload } from '../types'
import { clamp } from '../utils/colors'

interface Props { data: StatsPayload }

function loadCol(v: number): string {
  return v > 2.5 ? '#ff4560' : v > 1.2 ? '#f472b6' : '#a78bfa'
}

export function LoadCard({ data }: Props) {
  const [l1, l5, l15] = data.load

  return (
    <div className="card card-l">
      <div className="card-label">LOAD AVG <span className="card-label-blink">█</span></div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', textAlign: 'center' }}>
        {([['1m', l1], ['5m', l5], ['15m', l15]] as const).map(([lbl, val]) => (
          <div key={lbl}>
            <div style={{
              fontSize: '22px', fontWeight: 700, color: loadCol(val), lineHeight: 1,
              filter: `drop-shadow(0 0 5px ${loadCol(val)})`,
              transition: 'color 0.5s, filter 0.5s',
            }}>
              {val.toFixed(2)}
            </div>
            <div style={{ fontSize: '9.5px', color: 'var(--dim)', marginTop: '4px', letterSpacing: '0.1em' }}>
              {lbl}
            </div>
            <div className="bar-track" style={{ height: '3px', marginTop: '6px' }}>
              <div className="bar-fill" style={{
                width: `${clamp((val / 4) * 100, 0, 100)}%`,
                background: loadCol(val),
              }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
