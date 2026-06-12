import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface SectionLabelProps {
  children: ReactNode
  className?: string
}

export default function SectionLabel({ children, className }: SectionLabelProps) {
  return (
    <p className={cn('text-[10px] font-bold tracking-[0.1em] uppercase text-text-3 mb-[14px]', className)}>
      {children}
    </p>
  )
}
