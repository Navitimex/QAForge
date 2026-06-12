'use client'

import { cn } from '@/lib/cn'
import { scoreColor, scoreColorDim } from '@/lib/utils'

export type OptionState = 'default' | 'selected' | 'correct' | 'wrong'

interface OptionCardProps {
  label: string
  text: string
  state?: OptionState
  onClick?: () => void
}

export default function OptionCard({ label, text, state = 'default', onClick }: OptionCardProps) {
  const isDynamic = state === 'correct' || state === 'wrong'
  const isCorrect = state === 'correct'

  const dynamicCardStyle = isDynamic ? {
    background: isCorrect ? scoreColorDim(100) : scoreColorDim(0),
    borderColor: isCorrect ? scoreColor(100) : scoreColor(0),
  } : undefined

  const dynamicLabelStyle = isDynamic ? {
    background: isCorrect ? scoreColor(100) : scoreColor(0),
    color: '#fff',
  } : undefined

  return (
    <button
      onClick={onClick ?? undefined}
      className={cn(
        'w-full flex items-start gap-3 px-[14px] py-3 border rounded-xl',
        'font-[inherit] text-left transition-all duration-[140ms]',
        onClick ? 'cursor-pointer' : 'cursor-default',
        state === 'default'  && 'bg-transparent border-border',
        state === 'selected' && 'bg-accent/[0.08] border-accent',
        isDynamic            && 'border',
      )}
      style={dynamicCardStyle}
    >
      <span
        className={cn(
          'min-w-[26px] h-[26px] shrink-0 flex items-center justify-center',
          'rounded-[7px] text-xs font-bold border border-border',
          'transition-[background,color] duration-[140ms]',
          state === 'default'  && 'bg-card text-text-2',
          state === 'selected' && 'bg-accent text-white border-transparent',
          isDynamic            && 'border-transparent',
        )}
        style={dynamicLabelStyle}
      >
        {label}
      </span>
      <span
        className={cn(
          'text-sm leading-[1.55] pt-[3px]',
          state === 'wrong' ? 'text-text-2' : 'text-text',
        )}
      >
        {text}
      </span>
    </button>
  )
}
