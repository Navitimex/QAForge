import { cn } from '@/lib/cn'

export interface ToggleOption {
  id: string
  label: string
  color?: string
}

interface ToggleGroupProps {
  options: ToggleOption[]
  value: string | string[]
  onChange: (id: string) => void
  className?: string
}

export default function ToggleGroup({ options, value, onChange, className }: ToggleGroupProps) {
  const selected = Array.isArray(value) ? value : [value]

  return (
    <div className={cn('flex gap-2', className)}>
      {options.map(opt => {
        const isSelected = selected.includes(opt.id)
        const dynamicStyle = opt.color
          ? isSelected
            ? { borderColor: opt.color, background: `${opt.color}18`, color: opt.color }
            : { borderColor: 'var(--border)', background: 'var(--card)', color: 'var(--text-2)' }
          : undefined

        return (
          <button
            key={opt.id}
            onClick={() => onChange(opt.id)}
            className={cn(
              'flex-1 py-2.5 text-[13px] font-[inherit] rounded-btn border cursor-pointer',
              'transition-all duration-[120ms]',
              !opt.color && isSelected  && 'border-accent bg-accent/[0.10] text-accent font-semibold',
              !opt.color && !isSelected && 'border-border bg-card text-text-2',
            )}
            style={dynamicStyle}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
