# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Development server:**
```bash
yarn start                # Clean and start development server
yarn develop             # Same as start
```

**Build and deployment:**
```bash
yarn build               # Clean and build for production
yarn serve               # Serve production build locally
yarn clean               # Clean Gatsby cache and public directory
```

**Code quality:**
```bash
yarn lint                # Run ESLint on src/
yarn lint:fix            # Auto-fix linting issues
```

**Content management:**
```bash
yarn sync               # Sync career data (currently vestigial)
yarn resume:pdf         # Generate resume PDF from production site
yarn resume:md          # Generate resume markdown
yarn skills:add         # Bulk add skills to career data
yarn skills:list        # List all skills in career data
```

## Architecture Overview

### Framework & Core Technologies
- **Gatsby 5** - Static site generator with React
- **React 18** - UI framework
- **Emotion** - CSS-in-JS styling with both `css` prop and styled components
- **SASS** - Additional stylesheet support
- **GraphQL** - Data layer for querying career data and site content

### Project Structure
```
src/
├── components/          # Reusable UI components
├── pages/              # Gatsby pages (routes)
├── layouts/            # Page layout wrappers
├── hooks/              # Custom React hooks (notably useDarkMode)
├── data/               # JSON data files (careerData.json)
├── utils/              # Utility functions and constants
├── images/             # Static images and logos
└── files/              # Downloadable files (resume PDF)
```

### Key Components & Patterns

**Layout System:**
- `MainLayout` - Primary page wrapper
- `Layout` compound component with `Layout.Content`, `Layout.Main`, `Layout.Footer`, `Layout.Sidebar`
- Mobile-responsive with hamburger navigation

**Styling Approach:**
- Global styles in `src/components/GlobalStyles/` with modular color, typography, theme files
- CSS custom properties for theming (light/dark mode support)
- Emotion's `css` prop for component-specific styles
- Responsive design with mobile-first breakpoints

**Data Management:**
- Career data stored in `src/data/careerData.json` with structured format for experience, skills, projects
- GraphQL queries in page components to access career data
- Custom hooks for state management (dark mode toggle)

### Content & Data Structure
- Personal/professional information sourced from `careerData.json`
- Skills system with ratings, experience levels, and categorization
- Project tiles and experience sections driven by JSON data
- Resume generation scripts that work with production deployment

### Dark Mode Implementation
Custom dark mode implementation in `src/hooks/useDarkMode/` with persistent storage and theme switching.

## Important Notes
- Site deploys to Netlify automatically
- Resume PDF generation hits the production site at clintonlangosch.com
- Career data is maintained in-repo (no external API dependency)
- Uses Feather icons and Devicon for iconography
- No test suite currently configured