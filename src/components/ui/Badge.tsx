import React from 'react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'outline'
  className?: string
}

const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', className }) => {
  const variants = {
    default: 'bg-[var(--s3)] text-[var(--text)] border-[var(--border)]',
    success: 'bg-[var(--green)]/10 text-[var(--green)] border-[var(--green)]/20',
    warning: 'bg-[var(--gold)]/10 text-[var(--gold)] border-[var(--gold)]/20',
    error: 'bg-[var(--red)]/10 text-[var(--red)] border-[var(--red)]/20',
    info: 'bg-[var(--blue)]/10 text-[var(--blue)] border-[var(--blue)]/20',
    outline: 'bg-transparent border-[var(--border)] text-dim',
  }

  return (
    <span className={cn(
      "inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider border",
      variants[variant],
      className
    )}>
      {children}
    </span>
  )
}

export default Badge
