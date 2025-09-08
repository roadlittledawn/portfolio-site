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
    expert: 'bg-green-100 text-green-800',
    advanced: 'bg-blue-100 text-blue-800',
    intermediate: 'bg-yellow-100 text-yellow-800',
    beginner: 'bg-red-100 text-red-800'
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
    return `${base} bg-primary text-white border-2 border-primary hover:shadow-md`;
  }
  
  const variants = {
    primary: `${base} bg-primary text-white border-2 border-primary hover:shadow-md`,
    secondary: `${base} bg-white text-gray-700 border-2 border-gray-300 hover:border-primary hover:text-primary`,
    ghost: `${base} text-gray-700 hover:bg-gray-100`
  };
  
  return variants[variant];
}

/**
 * Combine class names, filtering out undefined/null values
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}