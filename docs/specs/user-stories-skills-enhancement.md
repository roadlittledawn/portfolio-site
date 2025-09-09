# Skills Page Enhancement User Stories

## User Story 1: Filter by Skill Level
**As a** visitor to the portfolio  
**I want to** filter skills by proficiency level (Expert, Intermediate, Beginner)  
**So that I can** quickly identify the person's strongest skills or see their learning journey

### Acceptance Criteria
- A dropdown filter labeled "Skill Level" appears on the skills page
- Dropdown options include:
  - All Levels (default)
  - Expert Only
  - Intermediate Only  
  - Beginner Only
- When a level is selected, only skills matching that level are displayed
- The filter works in both grid view and category view
- Filter state persists when switching between views
- URL updates to reflect filter state (e.g., `?level=expert`)

### Implementation Notes
- Use the existing `level` field in skill data ("Expert", "Intermediate", "Beginner")
- Integrate with existing FilterNav component
- Maintain consistency with current filter behavior

---

## User Story 2: Sort Skills
**As a** visitor to the portfolio  
**I want to** sort skills by rating or alphabetically  
**So that I can** see skills organized by proficiency or find specific skills easily

### Acceptance Criteria
- A dropdown labeled "Sort By" appears on the skills page
- Dropdown options include:
  - Highest Rated First (default)
  - Lowest Rated First
  - Alphabetical (A-Z)
  - Alphabetical (Z-A)
- In grid view: sorts all skills on the page
- In category view: sorts skills within each category section while maintaining category order
- Sort preference persists when switching between views
- Works in combination with skill level filter

### Implementation Notes
- Use the `rating` field (1-5) for rating-based sorting
- Use the `name` field for alphabetical sorting
- Ensure stable sort (maintains relative order of equal items)
- Consider adding sort direction indicators

---

## Technical Requirements
1. **Component Updates**
   - Extend FilterNav component to support additional dropdown filters
   - Add new props for level filter and sort options
   - Maintain backward compatibility

2. **State Management**
   - URL state for both filter and sort selections
   - Combine with existing focus filter (all/writing/engineering)
   - Handle multiple filter combinations gracefully

3. **Performance**
   - Client-side filtering and sorting only
   - No additional API calls or data fetching
   - Smooth transitions when filter/sort changes

4. **Accessibility**
   - Proper ARIA labels for dropdowns
   - Keyboard navigation support
   - Screen reader announcements for filter changes

## Future Enhancements
- Save filter/sort preferences in localStorage
- Add skill search functionality
- Bulk filter selection (e.g., Expert + Intermediate)
- Custom sort options (e.g., by years of experience)