import { clamp } from '../../utils/colors'

interface Props {
  value: number
  max?: number
  color: string
  label?: string
  sub?: string
  size?: number
}

export function RingGauge({ value, max = 100, color, label, sub, size = 110 }: Props) {
  const R = size / 2 - 9
  const C = 2 * Math.PI * R
  const pct = clamp(value / max, 0, 1)

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ display: 'block', margin: '0 auto' }}
    >
      <circle
        cx={size / 2} cy={size / 2} r={R}
        fill="none" stroke="rgba(139,108,240,0.09)" strokeWidth="7"
      />
      <circle
        cx={size / 2} cy={size / 2} r={R}
        fill="none" stroke={color} strokeWidth="7"
        strokeDasharray={`${pct * C} ${(1 - pct) * C}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{
          transition: 'stroke-dasharray 0.65s ease, stroke 0.5s',
          filter: `drop-shadow(0 0 5px ${color})`,
        }}
      />
      <text
        x={size / 2} y={size / 2 - 2}
        textAnchor="middle" fill={color}
        fontSize="17" fontFamily="JetBrains Mono" fontWeight="600"
      >
        {Math.round(value)}{max === 100 ? '%' : ''}
      </text>
      {label && (
        <text
          x={size / 2} y={size / 2 + 13}
          textAnchor="middle" fill="var(--dim)"
          fontSize="8" fontFamily="JetBrains Mono"
        >
          {label}
        </text>
      )}
      {sub && (
        <text
          x={size / 2} y={size / 2 + 24}
          textAnchor="middle" fill="var(--dim)"
          fontSize="7.5" fontFamily="JetBrains Mono"
        >
          {sub}
        </text>
      )}
    </svg>
  )
}
