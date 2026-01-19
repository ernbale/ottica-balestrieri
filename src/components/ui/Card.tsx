'use client'

import { ReactNode, HTMLAttributes } from 'react'
import { clsx } from 'clsx'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'gradient'
  gradient?: 'primary' | 'secondary' | 'success' | 'info'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  hover?: boolean
}

function Card({
  variant = 'default',
  gradient,
  padding = 'md',
  hover = false,
  className,
  children,
  ...props
}: CardProps) {
  const baseStyles = 'rounded-xl transition-all duration-200'

  const variants = {
    default: 'bg-surface border border-border shadow-sm',
    glass: 'glass-card',
    gradient: '',
  }

  const gradients = {
    primary: 'gradient-card-1 text-white',
    secondary: 'gradient-card-2 text-white',
    success: 'gradient-card-3 text-white',
    info: 'gradient-card-4 text-white',
  }

  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  }

  return (
    <div
      className={clsx(
        baseStyles,
        variant === 'gradient' && gradient ? gradients[gradient] : variants[variant],
        paddings[padding],
        hover && 'hover:shadow-lg hover:-translate-y-1 cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title: string
  subtitle?: string
  action?: ReactNode
}

function CardHeader({ title, subtitle, action, className, ...props }: CardHeaderProps) {
  return (
    <div className={clsx('flex items-start justify-between mb-4', className)} {...props}>
      <div>
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        {subtitle && (
          <p className="text-sm text-foreground-muted mt-0.5">{subtitle}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}

interface CardContentProps extends HTMLAttributes<HTMLDivElement> {}

function CardContent({ className, children, ...props }: CardContentProps) {
  return (
    <div className={clsx('', className)} {...props}>
      {children}
    </div>
  )
}

interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {}

function CardFooter({ className, children, ...props }: CardFooterProps) {
  return (
    <div
      className={clsx('flex items-center justify-end gap-3 mt-4 pt-4 border-t border-border', className)}
      {...props}
    >
      {children}
    </div>
  )
}

export { Card, CardHeader, CardContent, CardFooter }
export type { CardProps, CardHeaderProps, CardContentProps, CardFooterProps }
