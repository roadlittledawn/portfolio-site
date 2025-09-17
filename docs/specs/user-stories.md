# Portfolio Site User Stories

## Epic 1: Navigation & Routing
**US-001**: As a visitor, I want to land on a clear homepage that explains Clinton's dual expertise in technical writing and software engineering
- **Acceptance Criteria**: 
  - Homepage has clear hero section explaining both backgrounds
  - Clear navigation to specialized landing pages
  - Professional, clean design that reflects both skill sets

**US-002**: As a hiring manager looking for technical writers, I want to navigate to `/technical-writing` to see writing-focused content  
- **Acceptance Criteria**:
  - Dedicated technical writing landing page
  - Highlights writing experience, samples, and relevant projects
  - Clear path to writing-focused skills and experience

**US-003**: As a tech recruiter, I want to navigate to `/software-engineering` to see engineering content
- **Acceptance Criteria**:
  - Dedicated software engineering landing page  
  - Highlights engineering experience, technical projects, and code samples
  - Clear path to engineering-focused skills and experience

## Epic 2: Content Filtering  
**US-004**: As a visitor, I want to filter skills by `?focus=writing|engineering|all`
- **Acceptance Criteria**:
  - Skills page responds to URL query parameters
  - Smooth filtering animations
  - URL updates when filter changes
  - Default shows all skills if no focus specified

**US-005**: As a visitor, I want to filter projects with the same query param pattern
- **Acceptance Criteria**:
  - Projects page responds to same focus query parameters
  - Writing projects show content samples, engineering projects show technical details
  - Cross-over projects show appropriate details for current focus

**US-006**: As a visitor, I want URL state to persist when sharing filtered links
- **Acceptance Criteria**:
  - Shareable URLs maintain filter state
  - Browser back/forward works with filter state
  - Bookmarking filtered views works correctly

## Epic 3: Content Display
**US-007**: As a visitor, I want to see relevant skills/projects highlighted for each focus area
- **Acceptance Criteria**:
  - Skills and projects have clear focus area indicators
  - Appropriate content is emphasized based on current context
  - Cross-over items show relevance to current focus

**US-008**: As a visitor, I want to see writing samples embedded or linked from Google Docs
- **Acceptance Criteria**:
  - Writing samples are easily accessible
  - Links to actual published work where available
  - Clean presentation of writing portfolio

**US-009**: As a visitor, I want smooth transitions between filtered states
- **Acceptance Criteria**:
  - No jarring page reloads when filtering
  - Smooth CSS transitions for filtering animations
  - Loading states if needed for dynamic content