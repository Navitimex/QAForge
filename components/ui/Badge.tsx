import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface BadgeProps {
  children: ReactNode
  color?: string
  className?: string
}

export default function Badge({ children, color, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-[7px] py-[2px] rounded-[5px]',
        'text-[10px] font-semibold tracking-[0.04em] uppercase',
        !color && 'bg-card text-text-3',
        className,
      )}
      style={color ? { background: `${color}18`, color } : undefined}
    >
      {children}
    </span>
  )
}
