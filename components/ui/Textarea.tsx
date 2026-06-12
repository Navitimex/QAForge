import type { TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>

export default function Textarea({ className, ...rest }: TextareaProps) {
  return (
    <textarea
      className={cn(
        'w-full rounded-lg border border-border bg-surface text-text text-sm',
        'px-3 py-2.5 font-[inherit] box-border resize-y',
        className,
      )}
      {...rest}
    />
  )
}
