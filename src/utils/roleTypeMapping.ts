/**
 * Role Type Mapping Utilities
 * Centralized mappings for role types to focus areas
 */

export type FocusArea = 'engineering' | 'writing';

/**
 * Map role types to focus areas
 */
export const ROLE_TO_FOCUS: Record<string, FocusArea> = {
  'software_engineer': 'engineering',
  'engineering_manager': 'engineering',
  'technical_writer': 'writing',
  'technical_writing_manager': 'writing',
};

/**
 * Map focus areas to role types
 */
export const FOCUS_TO_ROLES: Record<FocusArea, string[]> = {
  'engineering': ['software_engineer', 'engineering_manager'],
  'writing': ['technical_writer', 'technical_writing_manager'],
};

/**
 * Get focus area(s) from an array of role types
 */
export function getFocusFromRoleTypes(roleTypes: string[]): FocusArea[] {
  const focuses = new Set<FocusArea>();

  roleTypes.forEach(rt => {
    const focus = ROLE_TO_FOCUS[rt];
    if (focus) focuses.add(focus);
  });

  return Array.from(focuses);
}

/**
 * Get role types for a focus area
 */
export function getRoleTypesForFocus(focus: FocusArea): string[] {
  return FOCUS_TO_ROLES[focus] || [];
}

/**
 * Check if role types include a specific focus area
 */
export function hasFocus(roleTypes: string[], focus: FocusArea): boolean {
  return roleTypes.some(rt => ROLE_TO_FOCUS[rt] === focus);
}

/**
 * Get display name for role type
 */
export const ROLE_DISPLAY_NAMES: Record<string, string> = {
  'software_engineer': 'Software Engineer',
  'engineering_manager': 'Engineering Manager',
  'technical_writer': 'Technical Writer',
  'technical_writing_manager': 'Technical Writing Manager',
};

/**
 * Get display name for a role type
 */
export function getRoleDisplayName(roleType: string): string {
  return ROLE_DISPLAY_NAMES[roleType] || roleType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

/**
 * Get focus area display name
 */
export const FOCUS_DISPLAY_NAMES: Record<FocusArea | 'all', string> = {
  'all': 'All',
  'engineering': 'Software Engineering',
  'writing': 'Technical Writing',
};

/**
 * Get icon name for focus area
 */
export const FOCUS_ICONS: Record<FocusArea | 'all', string> = {
  'all': 'layers',
  'engineering': 'cpu',
  'writing': 'edit-3',
};
