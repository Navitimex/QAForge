import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { scoreColor } from '@/lib/utils'

type Variant = 'primary' | 'secondary' | 'ghost' | 'green'
type Size    = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: Variant
  size?: Size
}

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-lg',
  md: 'px-4 py-2.5 text-sm rounded-btn',
  lg: 'px-5 py-3 text-[15px] rounded-[11px] w-full',
}

const variantClasses: Record<Exclude<Variant, 'green'>, string> = {
  primary:   'bg-accent text-white border-transparent',
  secondary: 'bg-transparent text-text border border-border',
  ghost:     'bg-transparent text-text-2 border border-border',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled,
  className,
  ...rest
}: ButtonProps) {
  const isGreen = variant === 'green'

  return (
    <button
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center gap-1.5 font-semibold tracking-[-0.01em]',
        'transition-opacity duration-[120ms] shrink-0 cursor-pointer font-[inherit]',
        'disabled:opacity-[0.38] disabled:cursor-not-allowed',
        sizeClasses[size],
        !isGreen && variantClasses[variant],
        className,
      )}
      style={isGreen ? { background: scoreColor(100), color: '#fff', border: 'none' } : undefined}
      {...rest}
    >
      {children}
    </button>
  )
}
