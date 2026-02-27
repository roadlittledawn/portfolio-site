import { clsx } from 'clsx';
import type { ReactNode, HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: 'default' | 'bordered' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export default function Card({
  children,
  variant = 'default',
  padding = 'md',
  className,
  ...props
}: CardProps) {
  const baseStyles = 'bg-dark-card rounded-lg';

  const variantStyles = {
    default: 'border border-dark-border',
    bordered: 'border-2 border-dark-border',
    elevated: 'border border-dark-border shadow-lg',
  };

  const paddingStyles = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={clsx(baseStyles, variantStyles[variant], paddingStyles[padding], className)}
      {...props}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}

export function CardHeader({ title, description, actions, className }: CardHeaderProps) {
  return (
    <div className={clsx('flex justify-between items-start mb-6', className)}>
      <div>
        <h2 className="text-xl font-semibold text-text-primary">{title}</h2>
        {description && (
          <p className="text-text-secondary mt-1">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

interface CardSectionProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

export function CardSection({ title, children, className }: CardSectionProps) {
  return (
    <div className={clsx('py-4 border-t border-dark-border first:border-t-0 first:pt-0', className)}>
      {title && (
        <h3 className="text-sm font-medium text-text-secondary uppercase tracking-wider mb-4">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}
