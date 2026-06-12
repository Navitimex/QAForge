import { cn } from '@/lib/cn'

interface Tab<T extends string> {
  id: T
  label: string
}

interface TabsProps<T extends string> {
  tabs: Tab<T>[]
  active: T
  onChange: (id: T) => void
  className?: string
}

export default function Tabs<T extends string>({ tabs, active, onChange, className }: TabsProps<T>) {
  return (
    <div className={cn('flex gap-2 bg-card p-1 rounded-btn border border-border', className)}>
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            'flex-1 py-2 text-sm font-semibold rounded-lg',
            'font-[inherit] cursor-pointer transition-colors duration-[120ms]',
            active === tab.id
              ? 'bg-surface text-text'
              : 'bg-transparent text-text-2',
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
