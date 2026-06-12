import { cn } from '@/lib/cn'

interface StatCardProps {
  label: string
  value: string | number
  color?: string
  className?: string
}

export default function StatCard({ label, value, color, className }: StatCardProps) {
  return (
    <div className={cn('bg-card border border-border rounded-xl p-[14px] text-center', className)}>
      <div
        className="text-[22px] font-bold font-display nums-compact"
        style={{ color: color ?? 'var(--text)' }}
      >
        {value}
      </div>
      <div className="text-[11px] uppercase tracking-[0.07em] text-text-3 mt-1">
        {label}
      </div>
    </div>
  )
}
