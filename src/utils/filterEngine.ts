/**
 * Filter Engine Utilities
 * Reusable filtering and sorting functions for skills/projects pages
 */

export interface FilterState {
  focus: string;
  level: string;
  sortBy: string;
  view: string;
}

export interface FilterableItem {
  element: HTMLElement;
  focus?: string;
  level?: string;
  name?: string;
  rating?: number;
  yearsOfExperience?: number;
}

/**
 * Check if item matches focus filter
 */
export function matchesFocus(itemFocus: string | undefined, filterFocus: string): boolean {
  if (filterFocus === 'all') return true;
  if (!itemFocus) return false;

  if (filterFocus === 'engineering') {
    return itemFocus.includes('engineering') || itemFocus.includes('software_engineer');
  }
  if (filterFocus === 'writing') {
    return itemFocus.includes('writing') || itemFocus.includes('technical_writer');
  }

  return itemFocus.includes(filterFocus);
}

/**
 * Check if item matches level filter
 */
export function matchesLevel(itemLevel: string | undefined, filterLevel: string): boolean {
  if (filterLevel === 'all') return true;
  if (!itemLevel) return false;

  return itemLevel.toLowerCase() === filterLevel.toLowerCase();
}

/**
 * Filter cards based on focus and level
 */
export function filterCards(
  cards: HTMLElement[],
  focus: string,
  level: string
): { visible: HTMLElement[]; hidden: HTMLElement[] } {
  const visible: HTMLElement[] = [];
  const hidden: HTMLElement[] = [];

  cards.forEach(card => {
    const cardFocus = card.dataset.focus || '';
    const cardLevel = card.dataset.level || '';

    const focusMatch = matchesFocus(cardFocus, focus);
    const levelMatch = matchesLevel(cardLevel, level);

    if (focusMatch && levelMatch) {
      card.style.display = '';
      visible.push(card);
    } else {
      card.style.display = 'none';
      hidden.push(card);
    }
  });

  return { visible, hidden };
}

/**
 * Sort cards by various criteria
 */
export function sortCards(cards: HTMLElement[], sortBy: string): HTMLElement[] {
  return [...cards].sort((a, b) => {
    switch (sortBy) {
      case 'name-asc':
        return (a.dataset.name || '').localeCompare(b.dataset.name || '');

      case 'name-desc':
        return (b.dataset.name || '').localeCompare(a.dataset.name || '');

      case 'rating-desc':
        return Number(b.dataset.rating || 0) - Number(a.dataset.rating || 0);

      case 'rating-asc':
        return Number(a.dataset.rating || 0) - Number(b.dataset.rating || 0);

      case 'experience-desc':
        return Number(b.dataset.years || 0) - Number(a.dataset.years || 0);

      case 'experience-asc':
        return Number(a.dataset.years || 0) - Number(b.dataset.years || 0);

      default:
        return 0;
    }
  });
}

/**
 * Reorder cards in container based on sort order
 */
export function reorderCards(container: Element, cards: HTMLElement[]): void {
  cards.forEach(card => container.appendChild(card));
}

/**
 * Update category section visibility based on visible cards
 */
export function updateCategorySectionVisibility(): void {
  const categorySections = document.querySelectorAll('.category-section');
  categorySections.forEach(section => {
    const visibleItems = section.querySelectorAll('.skill-card:not([style*="display: none"]), .project-card:not([style*="display: none"])');
    (section as HTMLElement).style.display = visibleItems.length > 0 ? '' : 'none';
  });
}

/**
 * Get current filter values from DOM state
 */
export function getCurrentFilters(): FilterState {
  const activeFilterBtn = document.querySelector('.filter-btn.bg-accent-blue');
  const levelFilter = document.getElementById('level-filter') as HTMLSelectElement | null;
  const sortFilter = document.getElementById('sort-filter') as HTMLSelectElement | null;
  const activeViewBtn = document.querySelector('.view-btn.bg-accent-blue');

  return {
    focus: activeFilterBtn?.getAttribute('data-focus') || 'all',
    level: levelFilter?.value || 'all',
    sortBy: sortFilter?.value || 'name-asc',
    view: activeViewBtn?.getAttribute('data-view') || 'grid',
  };
}

/**
 * Update filter count displays
 */
export function updateFilterCounts(counts: Record<string, number>): void {
  Object.entries(counts).forEach(([key, count]) => {
    const countEl = document.querySelector(`.filter-count-${key}`);
    if (countEl) {
      countEl.textContent = `(${count})`;
    }
  });
}
