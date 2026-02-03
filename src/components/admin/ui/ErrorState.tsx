/**
 * ErrorState Component
 * Consistent error display with optional retry button
 */

interface ErrorStateProps {
  /** Error message to display */
  message: string;
  /** Optional retry callback */
  onRetry?: () => void;
  /** Label for retry button */
  retryLabel?: string;
}

export default function ErrorState({
  message,
  onRetry,
  retryLabel = 'Retry',
}: ErrorStateProps) {
  return (
    <div className="p-6 bg-red-900/20 border border-red-500/50 rounded-lg text-center">
      <p className="text-red-400 mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-accent-blue hover:bg-accent-blue/80 text-white font-medium rounded-lg transition-colors"
        >
          {retryLabel}
        </button>
      )}
    </div>
  );
}
