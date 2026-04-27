import { clamp } from '../../utils/colors'

interface Props {
  value: number
  min?: number
  max?: number
  color: string
  size?: number
}

const ZONES: [number, number, string][] = [
  [150, 230, 'rgba(139,108,240,0.1)'],
  [230, 310, 'rgba(244,114,182,0.1)'],
  [310, 390, 'rgba(255,69,96,0.09)'],
]

export function ArcGauge({ value, min = 30, max = 90, color, size = 136 }: Props) {
  const cx = size / 2, cy = size / 2, R = size / 2 - 13
  const pct = clamp((value - min) / (max - min), 0, 1)
  const toXY = (deg: number, r = R): [number, number] => [
    cx + r * Math.cos((deg * Math.PI) / 180),
    cy + r * Math.sin((deg * Math.PI) / 180),
  ]
  const arc = (a1: number, a2: number) => {
    const [sx, sy] = toXY(a1)
    const [ex, ey] = toXY(a2)
    return `M${sx} ${sy} A${R} ${R} 0 ${a2 - a1 > 180 ? 1 : 0} 1 ${ex} ${ey}`
  }
  const endA = 150 + pct * 240
  const ticks = [0, 25, 50, 75, 100]
  const status = value < 52 ? 'NOMINAL' : value < 68 ? 'WARM' : 'HOT'

  return (
    <svg
      width={size} height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ display: 'block', margin: '0 auto' }}
    >
      {ZONES.map(([a1, a2, c]) => (
        <path key={a1} d={arc(a1, a2)} fill="none" stroke={c} strokeWidth="10" strokeLinecap="butt" />
      ))}
      <path
        d={arc(150, Math.max(150.01, endA))}
        fill="none" stroke={color} strokeWidth="7" strokeLinecap="round"
        style={{ transition: 'd 0.65s ease, stroke 0.5s', filter: `drop-shadow(0 0 6px ${color})` }}
      />
      {ticks.map(p => {
        const a = 150 + p * 2.4
        const [ix, iy] = toXY(a, R - 10)
        const [ox, oy] = toXY(a, R - 4)
        return (
          <line key={p} x1={ix} y1={iy} x2={ox} y2={oy}
            stroke="rgba(167,139,250,0.2)" strokeWidth="1.5" />
        )
      })}
      <text
        x={cx} y={cy + 2} textAnchor="middle" fill={color}
        fontSize="28" fontFamily="JetBrains Mono" fontWeight="600"
        style={{ filter: `drop-shadow(0 0 6px ${color})` }}
      >
        {value.toFixed(1)}
      </text>
      <text x={cx} y={cy + 18} textAnchor="middle" fill="var(--dim)" fontSize="9" fontFamily="JetBrains Mono">
        °C
      </text>
      <text x={cx} y={cy + 32} textAnchor="middle" fill="var(--dim)" fontSize="8" fontFamily="JetBrains Mono">
        {status}
      </text>
    </svg>
  )
}
