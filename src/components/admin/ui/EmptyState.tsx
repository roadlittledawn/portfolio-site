/**
 * EmptyState Component
 * Consistent empty/no items display with optional action
 */

interface EmptyStateProps {
  /** Title text */
  title: string;
  /** Description text */
  description?: string;
  /** Icon to display (optional) */
  icon?: React.ReactNode;
  /** Action button configuration */
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}

export default function EmptyState({
  title,
  description,
  icon,
  action,
}: EmptyStateProps) {
  return (
    <div className="p-8 bg-dark-card border border-dark-border rounded-lg text-center">
      {icon && (
        <div className="mb-4 flex justify-center text-text-muted">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-text-primary mb-2">{title}</h3>
      {description && (
        <p className="text-text-secondary mb-4">{description}</p>
      )}
      {action && (
        action.href ? (
          <a
            href={action.href}
            className="inline-flex items-center gap-2 px-4 py-2 bg-accent-blue hover:bg-accent-blue/80 text-white font-medium rounded-lg transition-colors"
          >
            {action.label}
          </a>
        ) : (
          <button
            onClick={action.onClick}
            className="inline-flex items-center gap-2 px-4 py-2 bg-accent-blue hover:bg-accent-blue/80 text-white font-medium rounded-lg transition-colors"
          >
            {action.label}
          </button>
        )
      )}
    </div>
  );
}
