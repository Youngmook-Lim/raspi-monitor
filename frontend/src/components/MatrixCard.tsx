import { MatrixRain } from './canvas/MatrixRain'
import type { Theme } from '../hooks/useTheme'

interface Props { theme: Theme }

export function MatrixCard({ theme }: Props) {
  return (
    <div className="card card-x" style={{ padding: '14px', display: 'flex', flexDirection: 'column' }}>
      <div className="card-label">// ENTROPY STREAM <span className="card-label-blink">█</span></div>
      <div style={{ flex: 1, minHeight: '150px', overflow: 'hidden', borderRadius: '1px' }}>
        <MatrixRain theme={theme} />
      </div>
    </div>
  )
}
