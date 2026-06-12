import type { InputHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

type InputProps = InputHTMLAttributes<HTMLInputElement>

export default function Input({ className, ...rest }: InputProps) {
  return (
    <input
      className={cn(
        'w-full h-10 rounded-lg border border-border bg-surface text-text text-sm',
        'px-3 font-[inherit] box-border',
        className,
      )}
      {...rest}
    />
  )
}
