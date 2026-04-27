import { MatrixRain } from './canvas/MatrixRain'

export function MatrixCard() {
  return (
    <div className="card card-x" style={{ padding: '14px', display: 'flex', flexDirection: 'column' }}>
      <div className="card-label">// ENTROPY STREAM <span className="card-label-blink">█</span></div>
      <div style={{ flex: 1, minHeight: '150px', overflow: 'hidden', borderRadius: '1px' }}>
        <MatrixRain />
      </div>
    </div>
  )
}
