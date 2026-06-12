import { cn } from '@/lib/cn'

interface ChipProps {
  label: string
  selected?: boolean
  onClick?: () => void
  className?: string
}

export default function Chip({ label, selected = false, onClick, className }: ChipProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-[14px] py-[7px] rounded-full border text-[13px] font-[inherit] cursor-pointer',
        'transition-all duration-[120ms]',
        selected
          ? 'border-accent bg-accent/[0.12] text-accent font-semibold'
          : 'border-border bg-card text-text-2',
        className,
      )}
    >
      {label}
    </button>
  )
}
