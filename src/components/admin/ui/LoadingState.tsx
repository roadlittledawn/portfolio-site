/**
 * LoadingState Component
 * Consistent loading spinner display for admin pages
 */

interface LoadingStateProps {
  /** Optional message to display with spinner */
  message?: string;
  /** Size of the spinner */
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
};

export default function LoadingState({ message = 'Loading...', size = 'md' }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div
        className={`${sizeClasses[size]} border-2 border-dark-border border-t-accent-blue rounded-full animate-spin`}
      />
      {message && (
        <p className="mt-4 text-text-secondary text-sm">{message}</p>
      )}
    </div>
  );
}
