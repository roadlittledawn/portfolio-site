/**
 * URL State Management Utilities
 * Manage filter state in URL parameters for shareable views
 */

export interface URLState {
  focus?: string;
  level?: string;
  sort?: string;
  view?: string;
}

// Default values (not stored in URL)
const DEFAULTS: URLState = {
  focus: 'all',
  level: 'all',
  sort: 'name-asc',
  view: 'grid',
};

/**
 * Get current state from URL parameters
 */
export function getURLState(): URLState {
  const params = new URLSearchParams(window.location.search);

  return {
    focus: params.get('focus') || DEFAULTS.focus,
    level: params.get('level') || DEFAULTS.level,
    sort: params.get('sort') || DEFAULTS.sort,
    view: params.get('view') || DEFAULTS.view,
  };
}

/**
 * Update URL with new state (only stores non-default values)
 */
export function updateURL(state: Partial<URLState>): void {
  const url = new URL(window.location.href);

  // Merge with current state
  const current = getURLState();
  const newState = { ...current, ...state };

  // Update URL params
  Object.entries(newState).forEach(([key, value]) => {
    const defaultValue = DEFAULTS[key as keyof URLState];
    if (value && value !== defaultValue) {
      url.searchParams.set(key, value);
    } else {
      url.searchParams.delete(key);
    }
  });

  window.history.pushState({}, '', url.toString());
}

/**
 * Clear all filter state from URL
 */
export function clearURLState(): void {
  const url = new URL(window.location.href);
  Object.keys(DEFAULTS).forEach(key => url.searchParams.delete(key));
  window.history.pushState({}, '', url.toString());
}

/**
 * Generate shareable URL with current filter state
 */
export function getShareableURL(state: URLState): string {
  const url = new URL(window.location.href);

  Object.entries(state).forEach(([key, value]) => {
    const defaultValue = DEFAULTS[key as keyof URLState];
    if (value && value !== defaultValue) {
      url.searchParams.set(key, value);
    }
  });

  return url.toString();
}

/**
 * Check if URL has any filter state
 */
export function hasURLState(): boolean {
  const params = new URLSearchParams(window.location.search);
  return Object.keys(DEFAULTS).some(key => params.has(key));
}
