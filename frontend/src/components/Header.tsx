import { useState, useEffect } from 'react'
import type { StatsPayload } from '../types'
import { fmtUptime } from '../utils/format'
import type { Theme } from '../hooks/useTheme'

interface Props {
  data: StatsPayload
  live: boolean
  theme: Theme
  onToggleTheme: () => void
}

export function Header({ data, live, theme, onToggleTheme }: Props) {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const p = (n: number) => String(n).padStart(2, '0')
  const timeStr = `${p(now.getHours())}:${p(now.getMinutes())}:${p(now.getSeconds())}`
  const dateStr = now.toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
  })

  return (
    <div className="card card-h">
      <div className="hdr-wrap">
        <div className="hdr-l">
          <span className={`hdr-status ${live ? 'hdr-status-live' : 'hdr-status-mock'}`}>
            <span className={`hdr-dot ${live ? 'hdr-dot-live' : 'hdr-dot-mock'}`} />
            {live ? 'LIVE' : 'SIMULATED'}
          </span>
          <span className="hdr-hostname">{data.hostname}</span>
          <span className="hdr-sep">//</span>
          <span className="hdr-sub">system monitor · v1.0</span>
        </div>
        <div className="hdr-r">
          <span className="hdr-date">{dateStr}</span>
          <span className="hdr-time">{timeStr}</span>
          <span className="hdr-up">↑ {fmtUptime(data.uptime)}</span>
          <button className="theme-btn" onClick={onToggleTheme}>
            {theme === 'dark' ? '◐ LIGHT' : '● DARK'}
          </button>
        </div>
      </div>
    </div>
  )
}
