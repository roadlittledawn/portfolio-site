/**
 * Utility functions for consistent styling across components
 */

export type SkillLevel = 'expert' | 'advanced' | 'intermediate' | 'beginner';
export type Focus = 'writing' | 'engineering' | 'both' | 'all';

/**
 * Get Tailwind classes for skill level badges
 */
export function getLevelStyles(level: string): string {
  const styles: Record<string, string> = {
    expert: 'bg-accent-green/20 text-accent-green',
    advanced: 'bg-accent-blue/20 text-accent-blue',
    intermediate: 'bg-accent-amber/20 text-accent-amber',
    beginner: 'bg-red-500/20 text-red-400'
  };
  return styles[level.toLowerCase()] || styles.intermediate;
}

/**
 * Get button variant styles
 */
export function getButtonStyles(
  variant: 'primary' | 'secondary' | 'ghost' = 'secondary',
  isActive: boolean = false
): string {
  const base = 'px-4 py-2 rounded-lg font-medium transition-all duration-200';
  
  if (isActive) {
    return `${base} bg-accent-blue text-white border-2 border-accent-blue hover:shadow-md`;
  }
  
  const variants = {
    primary: `${base} bg-accent-blue text-white border-2 border-accent-blue hover:shadow-md`,
    secondary: `${base} bg-dark-card text-text-primary border-2 border-dark-border hover:border-accent-blue hover:text-accent-blue`,
    ghost: `${base} text-text-primary hover:bg-dark-layer`
  };
  
  return variants[variant];
}

/**
 * Combine class names, filtering out undefined/null values
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}