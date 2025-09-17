# Technical Specifications

## Data Structure

### Enhanced Skills Object
```json
{
  "name": "React.js",
  "level": "Intermediate", 
  "rating": 3,
  "tags": ["frontend", "library"],
  "focus": ["engineering"], // NEW: "writing" | "engineering" | "both"
  "yearsOfExperience": 4,
  "useOnResume": true,
  "description": "Optional detailed description for portfolio context"
}
```

### Enhanced Projects Object
```json
{
  "name": "docs-website",
  "displayName": "New Relic Docs Website",
  "description": "Technical description of the project",
  "summary": "Brief summary for cards",
  "focus": ["writing", "engineering"], // Can be both
  "type": "website", // "website" | "writing-sample" | "tool" | "library"
  "url": "https://docs.newrelic.com",
  "githubUrl": "https://github.com/newrelic/docs-website",
  "writingSamples": [ // NEW: for writing-focused projects
    {
      "title": "API Documentation Overhaul",
      "url": "https://docs.google.com/document/d/...",
      "type": "documentation"
    }
  ],
  "technologies": ["React.js", "Gatsby", "GraphQL"],
  "highlights": [
    "Led migration of 1000+ pages from Drupal to MDX",
    "Implemented i18n support for 5 languages"
  ],
  "images": [],
  "featured": true // For homepage/landing page display
}
```

## Route Specifications

### Static Routes
- `GET /` → Landing page (homepage)
- `GET /technical-writing` → Writing-focused overview  
- `GET /software-engineering` → Engineering-focused overview
- `GET /about` → Detailed background/biography
- `GET /contact` → Contact information and links

### Dynamic/Filtered Routes
- `GET /skills` → All skills (default)
- `GET /skills?focus=writing` → Writing-related skills only
- `GET /skills?focus=engineering` → Engineering-related skills only
- `GET /projects` → All projects (default)
- `GET /projects?focus=writing` → Writing-focused projects
- `GET /projects?focus=engineering` → Engineering-focused projects
- `GET /experience` → Work history (potentially filterable)

## Component Architecture

### Core Components
```
src/components/
├── layout/
│   ├── Header.astro
│   ├── Footer.astro
│   ├── Navigation.astro
│   └── BaseLayout.astro
├── content/
│   ├── SkillCard.astro
│   ├── ProjectCard.astro
│   ├── ExperienceCard.astro
│   └── FilterNav.astro
├── ui/
│   ├── Button.astro
│   ├── Badge.astro
│   └── Section.astro
└── utils/
    ├── filtering.js
    └── urlState.js
```

### JavaScript Requirements
- URL parameter management for filtering
- Smooth filtering animations (CSS transitions)
- Optional: Intersection Observer for scroll animations
- No framework dependencies - vanilla JS only

## Performance Requirements
- Lighthouse score: 95+ for all metrics
- First Contentful Paint: < 1.5s
- Largest Contentful Paint: < 2.5s
- Cumulative Layout Shift: < 0.1
- Static generation for all routes (no client-side routing needed)

## SEO Requirements
- Meta tags for each page/focus area
- Open Graph tags for social sharing
- Structured data for professional profile
- XML sitemap generation
- Clean, semantic URLs

## Deployment Specification
- **Platform**: Netlify
- **Build Command**: `npm run build`
- **Publish Directory**: `dist/`
- **Environment Variables**: None required initially
- **Branch Deployment**: `main` branch to production
- **Domain**: `clintonlangosch.com`