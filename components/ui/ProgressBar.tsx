interface ProgressBarProps {
  value: number
  max?: number
  color?: string
  height?: number
}

export default function ProgressBar({ value, max = 100, color, height = 2 }: ProgressBarProps) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0

  return (
    <div className="bg-border rounded-full overflow-hidden" style={{ height }}>
      <div
        className="h-full rounded-full transition-[width] duration-500 ease-in-out"
        style={{ width: `${pct}%`, background: color ?? 'var(--accent)' }}
      />
    </div>
  )
}
