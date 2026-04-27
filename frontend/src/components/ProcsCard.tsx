import type { StatsPayload } from '../types'
import { cpuColHex, clamp } from '../utils/colors'

interface Props { data: StatsPayload }

export function ProcsCard({ data }: Props) {
  const procs = [...data.processes].sort((a, b) => b.cpu - a.cpu)

  return (
    <div className="card card-p">
      <div className="card-label">TOP PROCESSES <span className="card-label-blink">█</span></div>
      <table className="proc-table">
        <thead>
          <tr>
            <th style={{ textAlign: 'left' }}>PID</th>
            <th style={{ textAlign: 'left' }}>NAME</th>
            <th style={{ textAlign: 'right' }}>CPU%</th>
            <th style={{ textAlign: 'right' }}>MEM%</th>
            <th style={{ width: '70px', textAlign: 'left', paddingLeft: '8px' }}>USAGE</th>
          </tr>
        </thead>
        <tbody>
          {procs.map(p => (
            <tr key={p.pid}>
              <td style={{ color: 'var(--dim)' }}>{p.pid}</td>
              <td style={{ color: 'var(--text)' }}>{p.name}</td>
              <td style={{ textAlign: 'right', color: cpuColHex(p.cpu), transition: 'color 0.5s' }}>
                {p.cpu.toFixed(1)}
              </td>
              <td style={{ textAlign: 'right', color: 'var(--green)' }}>{p.mem.toFixed(1)}</td>
              <td style={{ paddingLeft: '8px' }}>
                <div className="bar-track" style={{ height: '4px' }}>
                  <div className="bar-fill" style={{
                    width: `${clamp(p.cpu * 2.5, 0, 100)}%`,
                    background: cpuColHex(p.cpu),
                  }} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
