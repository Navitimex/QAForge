import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

export default function Card({ children, className, ...rest }: CardProps) {
  return (
    <div className={cn('bg-card border border-border rounded-xl', className)} {...rest}>
      {children}
    </div>
  )
}
