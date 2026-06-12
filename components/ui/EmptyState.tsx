import Link from 'next/link'
import { cn } from '@/lib/cn'
import Button from './Button'

interface EmptyStateProps {
  title: string
  description?: string
  action?: { label: string; href: string }
  className?: string
}

export default function EmptyState({ title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('bg-card border border-border rounded-xl p-6 text-center flex flex-col items-center gap-3', className)}>
      <p className="text-sm text-text-2">{title}</p>
      {description && <p className="text-xs text-text-3">{description}</p>}
      {action && (
        <Link href={action.href}>
          <Button size="sm" variant="secondary">{action.label}</Button>
        </Link>
      )}
    </div>
  )
}
