# Clinton Langosch Portfolio Site

A modern, component-driven portfolio website built with Astro, Tailwind CSS, and TypeScript. This project showcases Clinton's dual expertise in technical writing and software engineering through a unified, professional presentation.

## 🚀 Project Overview

This portfolio site represents a complete architectural transformation from a legacy Gatsby setup to a modern, maintainable component system. The site effectively presents Clinton's expertise in both technical writing and software engineering through specialized landing pages and comprehensive skill/project showcases.

## 🏗️ Architecture

### Technology Stack

- **Framework**: Astro v4.16.19 (Static Site Generation)
- **Styling**: Tailwind CSS with custom design system
- **Language**: TypeScript
- **Deployment**: Netlify (planned)
- **Development**: Modern toolchain with hot reload

### Component-Driven Design

The site is built on a foundation of 16 reusable components that enforce design consistency and enable rapid development:

```
src/components/
├── Layout Components
│   ├── PageHeader.astro      - Consistent page headers
│   ├── HeroSection.astro     - Hero sections with title/subtitle/description
│   └── GridContainer.astro   - Responsive grid layouts
├── Navigation Components
│   ├── FilterNav.astro       - Interactive filtering with URL state
│   └── QuickNav.astro        - Button grids for navigation
├── Content Components
│   ├── SkillCard.astro       - Skill display with ratings (grid/list variants)
│   ├── ProjectCard.astro     - Project showcase with metadata
│   ├── ExperienceCard.astro  - Work experience with highlights
│   ├── StrengthCard.astro    - Core expertise cards
│   ├── FocusCard.astro       - Homepage focus area cards
│   ├── ScrabbleName.astro    - Animated Scrabble tiles displaying full name
│   └── ScrabbleLogo.astro    - Compact Scrabble tile logo for header
├── UI Components
│   ├── Button.astro          - Multi-variant button system
│   ├── Icon.astro            - Unified icon system with fallback chain
│   ├── LevelBadge.astro      - Skill level indicators
│   ├── RatingStars.astro     - Star rating display
│   ├── StatCard.astro        - Statistics display
│   ├── Tag.astro             - Technology/skill tags
│   └── CategorySection.astro - Grouped content sections
└── Utilities
    ├── icons/                - Icon system with dual source support
    │   ├── featherIcons.ts   - General web app icons from Feather Icons
    │   └── customIcons.ts    - Technology/brand logos from DevIcon
    └── styles.ts             - Shared styling utilities and helpers
```

## 🎯 Key Features

### Unified Dual Expertise Presentation

- **Homepage**: Clean introduction highlighting both technical writing and engineering backgrounds
- **Specialized Landing Pages**: Dedicated pages for `/technical-writing` and `/software-engineering`
- **Cross-Functional Content**: Skills and projects tagged for both focus areas where applicable

### Interactive Filtering System

- **URL State Management**: Shareable filtered views with browser history support
- **Real-time Updates**: Client-side filtering with smooth animations
- **Focus-Based Navigation**: Easy switching between writing, engineering, and combined views

### Creative Branding Elements

- **ScrabbleName Component**: Animated Scrabble tiles displaying "Clinton Langosch" with authentic styling
  - 3D tile effects with birch wood texture background
  - Natural placement with random rotation (±8°) and translation (±3px/±2px)
  - Drop-in animation with staggered timing and accessibility support
  - Preserves randomization through animation keyframes

- **ScrabbleLogo Component**: Compact animated logo displaying "CLINTON" for header navigation
  - Same authentic Scrabble tile styling as ScrabbleName
  - Natural randomization with rotation (±5°) and translation (±1.5px/±1px)
  - Drop-in animation with 100ms staggered delays (respect's user motion preferences)
  - Hover wiggle effects on individual tiles
  - Size variants (sm, md, lg) for flexible usage
  - Integrated in site header replacing text-based logo

### Professional Portfolio Features

- **Skills Showcase**: Interactive skill cards with ratings, experience levels, and categorization
- **Project Portfolio**: Rich project cards with technology stacks, descriptions, and live links
- **Experience Timeline**: Professional experience cards with highlights and company information
- **Responsive Design**: Mobile-first approach with Tailwind breakpoint system

## 📋 Development Process

This project follows a spec-driven development approach with comprehensive documentation:

### Planning Documentation (docs/)

- **`docs/dev-log.md`**: Complete development journal with decision rationale and progress tracking
- **`docs/adr/001-framework-choice.md`**: Architectural Decision Record for choosing Astro
- **`docs/adr/002-unified-site-architecture.md`**: ADR for unified vs. separate site approach
- **`docs/specs/technical-specs.md`**: Technical requirements and component specifications
- **`docs/specs/user-stories.md`**: User-focused requirements and acceptance criteria

### Development Phases

1. **Initial Setup & Planning**: Framework selection, architecture decisions, data enhancement
2. **Core Functionality**: Skills/projects pages with filtering, specialized landing pages
3. **Component Architecture**: Complete refactor to reusable component system
4. **Tailwind Migration**: Elimination of custom CSS in favor of utility-first approach

## 🛠️ Development

### Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Project Structure

```
portfolio-site/
├── src/
│   ├── components/          # Reusable UI components
│   ├── layouts/            # Page layout templates
│   ├── pages/              # Route pages (Astro file-based routing)
│   ├── data/               # JSON data files
│   └── utils/              # Utility functions and helpers
├── docs/                   # Project documentation and ADRs
├── tailwind.config.mjs     # Tailwind CSS configuration
└── astro.config.mjs       # Astro framework configuration
```

### Data Management

**Public Site**: Content is managed through JSON files in `src/data/`:
- Career data including skills, projects, and work experience
- Focus tagging system for content filtering
- Structured data optimized for component consumption

**Admin Panel**: React-based CRUD interface at `/admin` for managing career data:
- Cookie-based JWT authentication via Netlify middleware
- GraphQL proxy architecture (service on different domain)
- React Islands for SSR admin pages
- Forms use react-hook-form

**GraphQL Proxy**: Admin mutations go through `/.netlify/functions/graphql-proxy`:
- Extracts `auth_token` cookie from requests
- Adds cookie as `Authorization: Bearer` header
- Forwards to external GraphQL service
- Required because browsers won't send cookies cross-domain

**Relevant files**:
- `netlify/functions/graphql-proxy.js` - Proxy function
- `src/lib/graphql-client.ts` - Client (points to proxy)
- `src/middleware.ts` - Cookie validation
- `src/components/admin/` - React admin components

## 🎨 Design System

### Color Palette

```js
colors: {
  'primary': '#3498db',           // Main brand blue
  'primary-dark': '#2c3e50',      // Dark headings
  'secondary': '#5a6c7d',         // Body text
  'accent': '#f39c12',            // Highlights (ratings)
  'muted': '#7f8c8d',            // Subtle text
  'border': '#e0e0e0',           // Borders
  'bg-light': '#f8f9fa',         // Light backgrounds
  'bg-lighter': '#ecf0f1',       // Lighter backgrounds
}
```

### Icon System

The site uses a dual-source icon system for comprehensive coverage:

**Sources:**

- **Feather Icons** ([feathericons.com](https://feathericons.com)): General web app icons (UI elements, navigation, actions)
- **DevIcon** ([devicon.dev](https://devicon.dev)): Technology/brand/language-specific logos and symbols

**Architecture:**

```typescript
// Icon component fallback chain:
1. Check featherIcons for UI icons (github, linkedin, code, etc.)
2. Check customIcons for technology logos (JavaScript, React, Node.js, etc.)
3. Fall back to "code" icon (angle brackets) if no match found

// Icon component accepts numeric pixel sizes (e.g., "16", "24", "48")
<Icon name="cpu" size="24" class="text-text-muted" />
```

**Available Feather Icons:**

- **Navigation**: github, linkedin, external-link, home, chevron-right/left/down, arrow-right
- **UI Elements**: code, filter, grid, list, layers, eye, globe, mail, star
- **Categories**: palette (frontend), settings (backend), database, tool, cloud, light-bulb (concepts), users (leadership), test-tube (testing)
- **Focus Areas**: edit-3 (writing), cpu (engineering), award (featured)
- **Actions**: book, edit, briefcase, file-text, user

**Usage:**

- **Skill Cards**: Use `iconName` field in data to map to specific icons
- **Social Links**: Feather icons for GitHub/LinkedIn in header
- **UI Elements**: Feather icons for filters, navigation, categories, and badges
- **Focus Cards**: Icons display at 48px for homepage focus areas
- **Filter Nav**: Icons display at 16px in filter buttons
- **Category Headers**: Icons display at 24px in section headers

### Component Variants

Most components support multiple variants for flexibility:

- **Buttons**: primary, secondary, ghost, link
- **Cards**: grid, list, featured
- **Icons**: Dual-source with intelligent fallback
- **Sizes**: xs, sm, md, lg, xl
- **States**: active, hover, disabled

## 🚀 Deployment

The site is configured for Netlify deployment:

- **Build Command**: `npm run build`
- **Publish Directory**: `dist/`
- **Branch**: Deploy from `main` branch
- **Domain**: `clintonlangosch.com`

## 📈 Future Enhancements

### Planned Features

- Experience/career page using ExperienceCard components
- About page with personal background
- Contact page with professional links
- SEO metadata components for better search visibility
- Animation enhancements for improved user experience

### Scalability

The component architecture enables rapid development of new pages and features:

- Consistent design system enforcement
- Reusable patterns reduce development time
- Easy maintenance through single-source-of-truth components
- Type-safe development with TypeScript integration

---

## 📝 Development Notes

This project demonstrates modern web development practices:

- **Component-driven architecture** for maintainability and consistency
- **Performance optimization** through static generation and minimal JavaScript
- **Professional presentation** suitable for resume and portfolio links
- **Comprehensive documentation** for future development and maintenance

The transformation from a complex, maintenance-heavy dual-branch Gatsby setup to this streamlined, component-based Astro site represents a significant improvement in both developer experience and end-user performance.

🤖 **Generated with [Claude Code](https://claude.ai/code)**
