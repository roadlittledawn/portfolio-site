# Admin UI Migration Plan: Consolidate into Portfolio Site

## Overview

Migrate the admin UI from `/Users/clinton/Projects/website-author-career-data` (Next.js) into `/Users/clinton/Projects/portfolio-site` (Astro) using **Astro + React Islands** architecture. This consolidates both UIs into a single codebase with unified dark theme and improved code quality.

## Key Decisions

| Decision | Choice |
|----------|--------|
| Framework | Astro + React Islands (preserve static public pages) |
| Admin Theme | Dark theme (unified with public site) |
| Refactoring | Include DRY improvements during migration |

---

## Phase 1: Foundation Setup

### 1.1 Add React Integration to Astro

**File: `astro.config.mjs`**
```javascript
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import netlify from '@astrojs/netlify';

export default defineConfig({
  site: 'https://clintonlangosch.com',
  output: 'hybrid', // Static by default, SSR where needed
  adapter: netlify(),
  integrations: [tailwind(), react()],
});
```

### 1.2 Install Dependencies

```bash
npm install @astrojs/react @astrojs/netlify react react-dom
npm install @anthropic-ai/sdk graphql graphql-request jsonwebtoken bcryptjs
npm install react-hook-form react-select marked clsx
npm install -D @types/react @types/react-dom @types/bcryptjs @types/jsonwebtoken
```

### 1.3 Port Netlify Functions

Copy from admin project to `netlify/functions/`:
- `auth-login.js` - JWT authentication
- `auth-verify.js` - Token validation
- `auth-logout.js` - Session cleanup
- `ai-assistant.js` - Claude API proxy

### 1.4 Create `netlify.toml`

```toml
[build]
  command = "npm run build"
  functions = "netlify/functions"
  publish = "dist"

[functions]
  node_bundler = "esbuild"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
```

### 1.5 Environment Variables

Add to `.env` and Netlify dashboard:
```
GRAPHQL_ENDPOINT=...
GRAPHQL_API_KEY=...
AUTH_SECRET=...
ADMIN_USERNAME=...
ADMIN_PASSWORD_HASH=...
ANTHROPIC_API_KEY=...
```

---

## Phase 2: Shared Libraries

### 2.1 Create Type Definitions

**File: `src/lib/types.ts`**

Port from `/Users/clinton/Projects/website-author-career-data/lib/types.ts`:
- Profile, Experience, Skill, Project, Education interfaces
- Achievement, PersonalInfo, Positioning types
- Role type enums

### 2.2 Create GraphQL Client

**File: `src/lib/graphql-client.ts`**

Port from admin project, configure for both build-time (sync script) and runtime (admin) use.

### 2.3 Create Auth Library

**File: `src/lib/auth.ts`**

Port auth utilities:
- `login()`, `logout()`, `verifyToken()`
- `getAuthHeader()`, `isAuthenticated()`
- localStorage token management

### 2.4 Create Constants

**File: `src/lib/constants.ts`**

Port role type options, organization options, skill categories.

---

## Phase 3: DRY Refactoring (Public Site)

### 3.1 Extract FilterNav Logic

**Current:** 240+ lines of inline JS in `FilterNav.astro`

**Refactor to:**
- `src/utils/filterEngine.ts` - Reusable filtering/sorting functions
- `src/utils/urlState.ts` - URL parameter management
- Keep FilterNav.astro as thin wrapper

### 3.2 Create NavLink Component

**Current:** Hardcoded navigation styles repeated 5x in BaseLayout.astro (lines 35-84)

**Create:** `src/components/NavLink.astro`
```astro
---
interface Props {
  href: string;
  currentPath: string;
}
const { href, currentPath } = Astro.props;
const isActive = currentPath === href;
---
<a href={href} class:list={[
  'px-3 py-2 rounded-md text-sm font-medium transition-all',
  isActive ? 'bg-accent-blue/20 text-accent-blue' : 'text-text-secondary hover:bg-dark-card hover:text-accent-blue'
]}>
  <slot />
</a>
```

### 3.3 Create CardBase Component

**Current:** Card styling repeated in SkillCard, ProjectCard, ExperienceCard

**Create:** `src/components/CardBase.astro`
- Shared `bg-dark-card border border-dark-border rounded-lg` wrapper
- Variants: default, featured, compact

### 3.4 Centralize Data Mappings

**Current:** Role type mappings hardcoded in multiple files

**Create:** `src/utils/roleTypeMapping.ts`
```typescript
export const focusMap = {
  'software_engineer': 'engineering',
  'engineering_manager': 'engineering',
  'technical_writer': 'writing',
  'technical_writing_manager': 'writing'
};
```

### 3.5 Extract Category Definitions

**Current:** Category order hardcoded in skills.astro

**Create:** `src/data/categories.json` or add to config

---

## Phase 4: Admin Layout & Auth

### 4.1 Create Admin Layout

**File: `src/layouts/AdminLayout.astro`**

- Dark theme (matching public site design tokens)
- Admin sidebar navigation
- Uses React AuthProvider island
- Distinct from public BaseLayout

### 4.2 Create Auth Components (React)

**Files in `src/components/admin/`:**
- `AuthProvider.tsx` - Context provider for auth state
- `ProtectedRoute.tsx` - Wrapper that redirects if not authenticated
- `LoginForm.tsx` - Login form component

### 4.3 Admin Navigation

**File: `src/components/admin/AdminNav.tsx`**

Links to: Dashboard, Profile, Experiences, Skills, Projects, Education, Job Agent

---

## Phase 5: Admin UI Components

### 5.1 UI Primitives (React + Tailwind Dark Theme)

**Create in `src/components/admin/ui/`:**

| Component | Purpose |
|-----------|---------|
| `Button.tsx` | Primary, secondary, ghost, danger variants |
| `Input.tsx` | Form text input with dark theme |
| `Textarea.tsx` | Multi-line input |
| `Select.tsx` | Dropdown select |
| `Card.tsx` | Container component |
| `Badge.tsx` | Status/type badges |
| `Tag.tsx` | Technology/skill tags |
| `Modal.tsx` | Dialog overlay |

### 5.2 Form Components

**Port from admin project to `src/components/admin/forms/`:**
- `ExperienceForm.tsx` - Work history CRUD
- `SkillsForm.tsx` - Skills CRUD
- `ProjectForm.tsx` - Projects CRUD
- `ProfileForm.tsx` - Profile editing
- `EducationForm.tsx` - Education CRUD

**Conversion required:**
- CSS Modules → Tailwind dark theme classes
- Update react-select styling for dark theme

### 5.3 List Components

**Port to `src/components/admin/lists/`:**
- `ExperiencesList.tsx`
- `SkillsList.tsx`
- `ProjectsList.tsx`
- `EducationList.tsx`

### 5.4 Detail Components

**Port to `src/components/admin/details/`:**
- `ExperienceDetail.tsx`
- `SkillDetail.tsx`
- `ProjectDetail.tsx`
- `ProfileView.tsx`
- `EducationDetail.tsx`

---

## Phase 6: Admin Pages

### 6.1 Route Structure

```
src/pages/admin/
├── index.astro              # Dashboard
├── login.astro              # Login page (public)
├── profile/
│   └── index.astro          # Profile view/edit
├── experiences/
│   ├── index.astro          # List
│   ├── new.astro            # Create
│   └── [id]/
│       ├── index.astro      # Detail
│       └── edit.astro       # Edit
├── skills/
│   ├── index.astro          # List
│   ├── new.astro            # Create
│   └── [id]/...
├── projects/
│   ├── index.astro          # List
│   ├── new.astro            # Create
│   └── [id]/...
├── education/
│   ├── index.astro          # List
│   ├── new.astro            # Create
│   └── [id]/...
└── job-agent/
    └── index.astro          # Job application workflow
```

### 6.2 Page Pattern

Each admin page wraps a React component:

```astro
---
// src/pages/admin/experiences/index.astro
import AdminLayout from '../../../layouts/AdminLayout.astro';
import ExperiencesPage from '../../../components/admin/pages/ExperiencesPage';
export const prerender = false; // Enable SSR for this route
---
<AdminLayout title="Experiences | Admin">
  <ExperiencesPage client:only="react" />
</AdminLayout>
```

---

## Phase 7: AI Integration

### 7.1 AI Components

**Port to `src/components/admin/ai/`:**
- `AIChatPanel.tsx` - Floating chat interface
- `AIButton.tsx` - Toggle button

**Port to `src/lib/hooks/`:**
- `useAIContext.ts` - Context building for Claude

### 7.2 AI Assistant Function

Update `netlify/functions/ai-assistant.js`:
- Keep Claude API integration
- Update CORS for new domain
- Ensure auth verification works

---

## Phase 8: Job Agent Feature

### 8.1 Job Agent Components

**Port to `src/components/admin/job-agent/`:**
- `JobInfoForm.tsx` - Job description input
- `ResumeGenerator.tsx` - Resume creation/iteration
- `CoverLetterGenerator.tsx` - Cover letter creation
- `ApplicationQuestionsAssistant.tsx` - Q&A workflow
- `ApplicationSummary.tsx` - Final review/download

### 8.2 Job Agent Prompts

**Port to `src/lib/job-agent-prompts.ts`:**
- Job type configurations
- LLM prompt templates
- Resume/cover letter generation prompts

---

## Phase 9: Theme Unification

### 9.1 Extend Tailwind Config

Update `tailwind.config.mjs` for admin-specific needs:

```javascript
// Form input styling
'input': {
  'bg': 'colors.dark.card',
  'border': 'colors.dark.border',
  'focus': 'colors.accent.blue',
}

// Admin-specific utilities
'admin-sidebar': {
  'width': '250px',
  'bg': 'colors.dark.layer',
}
```

### 9.2 Convert Admin CSS Modules

Map CSS Module classes to Tailwind equivalents:

| CSS Module | Tailwind |
|------------|----------|
| `.container` | `max-w-7xl mx-auto px-4` |
| `.card` | `bg-dark-card border border-dark-border rounded-lg p-6` |
| `.button-primary` | `bg-accent-blue hover:bg-accent-blue/80 text-white px-4 py-2 rounded` |
| `.input` | `bg-dark-card border border-dark-border rounded px-3 py-2 text-text-primary` |

---

## File Structure (Final)

```
portfolio-site/
├── astro.config.mjs           # + React, Netlify adapter, hybrid output
├── tailwind.config.mjs        # + admin/form styling
├── netlify.toml               # NEW
├── netlify/functions/         # NEW
│   ├── auth-login.js
│   ├── auth-verify.js
│   ├── auth-logout.js
│   └── ai-assistant.js
├── src/
│   ├── components/
│   │   ├── admin/             # NEW: React components
│   │   │   ├── AuthProvider.tsx
│   │   │   ├── AdminNav.tsx
│   │   │   ├── ui/
│   │   │   ├── forms/
│   │   │   ├── lists/
│   │   │   ├── details/
│   │   │   ├── ai/
│   │   │   ├── job-agent/
│   │   │   └── pages/
│   │   ├── CardBase.astro     # NEW: Refactored
│   │   ├── NavLink.astro      # NEW: Refactored
│   │   ├── FilterNav.astro    # REFACTORED: Thin wrapper
│   │   └── [existing components]
│   ├── layouts/
│   │   ├── BaseLayout.astro
│   │   └── AdminLayout.astro  # NEW
│   ├── lib/                   # NEW
│   │   ├── auth.ts
│   │   ├── graphql-client.ts
│   │   ├── types.ts
│   │   ├── constants.ts
│   │   ├── job-agent-prompts.ts
│   │   └── hooks/
│   ├── pages/
│   │   ├── admin/             # NEW
│   │   └── [existing pages]
│   ├── utils/
│   │   ├── styles.ts
│   │   ├── filterEngine.ts    # NEW: Extracted from FilterNav
│   │   ├── urlState.ts        # NEW: Extracted from FilterNav
│   │   └── roleTypeMapping.ts # NEW: Centralized mappings
│   └── data/
│       └── careerData.json
└── docs/
    └── admin-migration-plan.md
```

---

## Verification Plan

### Build Verification
```bash
npm run build  # Should complete without errors
npm run preview  # Test static + SSR pages locally
netlify dev  # Test with Netlify Functions
```

### Functional Testing

1. **Public Pages** - Unchanged behavior
   - [ ] Homepage renders correctly
   - [ ] Skills page filtering works
   - [ ] Projects page filtering works
   - [ ] Experience page displays correctly

2. **Authentication**
   - [ ] Login with valid credentials succeeds
   - [ ] Invalid credentials show error
   - [ ] Protected routes redirect to login
   - [ ] Logout clears session
   - [ ] Token persists across page navigation

3. **Admin CRUD**
   - [ ] Create new experience
   - [ ] Edit existing skill
   - [ ] Delete project
   - [ ] Update profile

4. **AI Features**
   - [ ] AI chat panel opens/closes
   - [ ] Messages send and receive responses
   - [ ] Context includes relevant career data

5. **Job Agent**
   - [ ] Job info form submits
   - [ ] Resume generates from career data
   - [ ] Cover letter generates
   - [ ] Documents download as markdown

---

## Critical Files to Modify/Create

| File | Action | Notes |
|------|--------|-------|
| `astro.config.mjs` | Modify | Add React, Netlify adapter, hybrid output |
| `tailwind.config.mjs` | Modify | Add form/input styling, admin utilities |
| `package.json` | Modify | Add React and admin dependencies |
| `netlify.toml` | Create | Netlify configuration |
| `src/layouts/AdminLayout.astro` | Create | Admin page wrapper |
| `src/lib/auth.ts` | Create | Auth utilities |
| `src/lib/types.ts` | Create | TypeScript interfaces |
| `src/components/admin/*` | Create | All admin React components |
| `src/pages/admin/*` | Create | Admin route pages |
| `src/components/FilterNav.astro` | Refactor | Extract logic to utils |
| `src/components/NavLink.astro` | Create | DRY navigation links |
| `src/components/CardBase.astro` | Create | DRY card wrapper |

---

## Post-Migration

After successful migration:
1. Archive the old admin project (`website-author-career-data`)
2. Update any bookmarks/links to admin UI
3. Update CI/CD if needed
4. Remove duplicate environment variables from old project
