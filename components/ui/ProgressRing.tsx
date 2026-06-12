import { scoreColor } from '@/lib/utils'

interface ProgressRingProps {
  score: number
  size?: number
  strokeWidth?: number
}

export default function ProgressRing({ score, size = 128, strokeWidth = 8 }: ProgressRingProps) {
  const p   = Math.min(100, Math.max(0, score ?? 0))
  const r   = (size - strokeWidth * 2) / 2
  const c   = 2 * Math.PI * r
  const col = scoreColor(p)

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90 block">
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke="var(--border)" strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke={col} strokeWidth={strokeWidth}
          strokeLinecap="round" strokeDasharray={c}
          strokeDashoffset={c - (p / 100) * c}
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className="font-display font-bold nums-compact"
          style={{ fontSize: size * 0.21, color: col }}
        >
          {p}%
        </span>
      </div>
    </div>
  )
}
