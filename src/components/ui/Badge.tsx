'use client'

import { HTMLAttributes, ReactNode } from 'react'
import { clsx } from 'clsx'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info' | 'neutral'
  size?: 'sm' | 'md'
  dot?: boolean
  icon?: ReactNode
}

function Badge({
  variant = 'primary',
  size = 'md',
  dot = false,
  icon,
  className,
  children,
  ...props
}: BadgeProps) {
  const sizes = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  }

  return (
    <span
      className={clsx(
        'badge',
        `badge-${variant}`,
        sizes[size],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={clsx(
            'w-1.5 h-1.5 rounded-full mr-1.5',
            variant === 'primary' && 'bg-primary',
            variant === 'secondary' && 'bg-secondary',
            variant === 'success' && 'bg-success',
            variant === 'error' && 'bg-error',
            variant === 'warning' && 'bg-warning',
            variant === 'info' && 'bg-info',
            variant === 'neutral' && 'bg-foreground-muted'
          )}
        />
      )}
      {icon && <span className="mr-1">{icon}</span>}
      {children}
    </span>
  )
}

// Status badge specifically for order/work statuses
interface StatusBadgeProps {
  status: 'nuovo' | 'in_lavorazione' | 'pronto' | 'consegnato' | 'annullato' | 'attesa_lenti' | 'attesa_montatura'
}

const statusConfig: Record<StatusBadgeProps['status'], { label: string; variant: BadgeProps['variant'] }> = {
  nuovo: { label: 'Nuovo', variant: 'info' },
  in_lavorazione: { label: 'In Lavorazione', variant: 'warning' },
  attesa_lenti: { label: 'Attesa Lenti', variant: 'secondary' },
  attesa_montatura: { label: 'Attesa Montatura', variant: 'secondary' },
  pronto: { label: 'Pronto', variant: 'success' },
  consegnato: { label: 'Consegnato', variant: 'neutral' },
  annullato: { label: 'Annullato', variant: 'error' },
}

function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status]
  return (
    <Badge variant={config.variant} dot>
      {config.label}
    </Badge>
  )
}

export { Badge, StatusBadge }
export type { BadgeProps, StatusBadgeProps }
