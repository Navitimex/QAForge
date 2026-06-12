import type { SelectHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  children: ReactNode
}

export default function Select({ children, className, ...rest }: SelectProps) {
  return (
    <select
      className={cn(
        'w-full h-10 rounded-lg border border-border bg-surface text-text text-sm',
        'px-3 font-[inherit] box-border cursor-pointer',
        className,
      )}
      {...rest}
    >
      {children}
    </select>
  )
}
