import { clsx } from 'clsx';
import type { ReactNode } from 'react';

interface TagProps {
  children: ReactNode;
  onRemove?: () => void;
  variant?: 'default' | 'primary' | 'outline';
  size?: 'sm' | 'md';
  className?: string;
}

export default function Tag({
  children,
  onRemove,
  variant = 'default',
  size = 'sm',
  className,
}: TagProps) {
  const baseStyles = 'inline-flex items-center font-medium rounded-md';

  const variantStyles = {
    default: 'bg-dark-hover text-text-secondary',
    primary: 'bg-accent-blue/20 text-accent-blue',
    outline: 'border border-dark-border text-text-secondary',
  };

  const sizeStyles = {
    sm: 'px-2 py-1 text-xs gap-1',
    md: 'px-3 py-1.5 text-sm gap-2',
  };

  return (
    <span className={clsx(baseStyles, variantStyles[variant], sizeStyles[size], className)}>
      {children}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="hover:text-red-400 transition-colors focus:outline-none"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </span>
  );
}

interface TagInputProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  placeholder?: string;
  label?: string;
  error?: string;
}

export function TagInput({ tags, onTagsChange, placeholder, label, error }: TagInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const input = e.currentTarget;
      const value = input.value.trim();
      if (value && !tags.includes(value)) {
        onTagsChange([...tags, value]);
        input.value = '';
      }
    } else if (e.key === 'Backspace' && !e.currentTarget.value && tags.length > 0) {
      onTagsChange(tags.slice(0, -1));
    }
  };

  const removeTag = (index: number) => {
    onTagsChange(tags.filter((_, i) => i !== index));
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-text-primary mb-2">
          {label}
        </label>
      )}
      <div
        className={clsx(
          'flex flex-wrap gap-2 p-3 bg-dark-layer border rounded-lg min-h-[46px]',
          error ? 'border-red-500' : 'border-dark-border focus-within:border-accent-blue'
        )}
      >
        {tags.map((tag, index) => (
          <Tag key={index} onRemove={() => removeTag(index)}>
            {tag}
          </Tag>
        ))}
        <input
          type="text"
          className="flex-1 min-w-[100px] bg-transparent text-text-primary placeholder-text-muted focus:outline-none"
          placeholder={tags.length === 0 ? placeholder : ''}
          onKeyDown={handleKeyDown}
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-400">{error}</p>
      )}
      <p className="mt-1 text-xs text-text-muted">Press Enter or comma to add a tag</p>
    </div>
  );
}
