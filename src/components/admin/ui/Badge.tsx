import { clsx } from 'clsx';
import type { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md';
  className?: string;
}

export default function Badge({
  children,
  variant = 'default',
  size = 'sm',
  className,
}: BadgeProps) {
  const baseStyles = 'inline-flex items-center font-medium rounded-full';

  const variantStyles = {
    default: 'bg-dark-hover text-text-secondary',
    primary: 'bg-accent-blue/20 text-accent-blue',
    success: 'bg-accent-green/20 text-accent-green',
    warning: 'bg-accent-amber/20 text-accent-amber',
    danger: 'bg-red-500/20 text-red-400',
    info: 'bg-accent-purple/20 text-accent-purple',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  };

  return (
    <span className={clsx(baseStyles, variantStyles[variant], sizeStyles[size], className)}>
      {children}
    </span>
  );
}

// Predefined badge variants for common use cases
export function StatusBadge({ status }: { status: 'active' | 'inactive' | 'pending' | 'featured' }) {
  const variants: Record<string, 'success' | 'default' | 'warning' | 'primary'> = {
    active: 'success',
    inactive: 'default',
    pending: 'warning',
    featured: 'primary',
  };

  return <Badge variant={variants[status]}>{status}</Badge>;
}

export function LevelBadge({ level }: { level: string }) {
  const variants: Record<string, 'default' | 'info' | 'primary' | 'success'> = {
    beginner: 'default',
    intermediate: 'info',
    advanced: 'primary',
    expert: 'success',
  };

  return <Badge variant={variants[level.toLowerCase()] || 'default'}>{level}</Badge>;
}
