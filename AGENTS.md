# AI Coding Assistant Guide

Comprehensive reference for AI coding assistants working on this codebase.

## Project Overview

This is a personal portfolio site with two main parts:

1. **Public Site**: Static Astro pages showcasing skills, projects, and experience
2. **Admin Panel**: React-based CRUD interface for managing career data

The site uses a hybrid architecture: public pages are statically generated, while admin pages use server-side rendering with React Islands.

## Technology Stack

| Layer     | Technology                      |
| --------- | ------------------------------- |
| Framework | Astro v4 (hybrid output mode)   |
| Admin UI  | React 18 with React Islands     |
| Styling   | Tailwind CSS (dark theme)       |
| Forms     | react-hook-form                 |
| Auth      | Cookie-based JWT via middleware |
| Functions | Netlify Functions (ES modules)  |
| Data      | GraphQL proxy → external API    |
| AI        | Anthropic Claude API            |

## Directory Structure

```
portfolio-site/
├── src/
│   ├── components/              # Astro components for public site
│   │   ├── *.astro             # UI components (Button, Card, Icon, etc.)
│   │   ├── icons/              # Icon SVG definitions
│   │   │   ├── featherIcons.ts # UI icons (Feather)
│   │   │   └── customIcons.ts  # Tech logos (DevIcon)
│   │   └── admin/              # React components for admin
│   │       ├── ui/             # Base UI components
│   │       ├── forms/          # Form components (ExperienceForm, SkillsForm, etc.)
│   │       ├── lists/          # List components
│   │       ├── ai/             # AI chat panel
│   │       ├── job-agent/      # Resume/cover letter generator
│   │       └── pages/          # Page-level React components
│   ├── layouts/
│   │   ├── BaseLayout.astro    # Public site layout
│   │   └── AdminLayout.astro   # Admin panel layout
│   ├── pages/
│   │   ├── *.astro             # Public pages (static, prerendered)
│   │   └── admin/              # Admin pages (SSR, `prerender = false`)
│   ├── lib/
│   │   ├── types.ts            # TypeScript interfaces
│   │   ├── auth.ts             # Client-side auth utilities
│   │   ├── graphql-client.ts   # GraphQL client (uses proxy)
│   │   ├── constants.ts        # Shared constants
│   │   ├── job-agent-prompts.ts# AI prompt templates
│   │   └── hooks/              # React hooks
│   ├── utils/
│   │   ├── styles.ts           # Tailwind utility functions
│   │   ├── filterEngine.ts     # Client-side filtering logic
│   │   ├── urlState.ts         # URL state management
│   │   └── roleTypeMapping.ts  # Role type mappings
│   ├── middleware.ts           # clang-auth check for /admin/*
├── netlify/functions/           # Serverless functions (ES modules)
│   ├── auth-me.ts              # Signed-in admin (clang-auth)
│   └── ai-assistant.js         # Claude API proxy
├── scripts/
│   └── sync-career-data.js     # Fetch data from GraphQL API
├── netlify.toml                # Netlify configuration
├── astro.config.mjs            # Astro configuration
└── tailwind.config.mjs         # Tailwind configuration
```

## Key Patterns

### GraphQL Direct Access Architecture

**How it works**: The portfolio site connects directly to the GraphQL API using API key-based authentication. There are two types of API keys:

1. **Read-only key** (`PUBLIC_GRAPHQL_READ_KEY`): Used on public pages, allows queries only
2. **Admin pages** use no key: the browser sends the clang-auth `ca_access` cookie (`credentials: "include"`), which the API verifies (admin grant + Origin check)

**Security**: No key or token is ever put in page JS. See `docs/auth-flow-diagram.md`.

**Flow**:

1. Public pages make GraphQL queries directly to the API with read-only key
2. Admin UI makes GraphQL requests directly to the API with the clang-auth cookie
3. No proxy or intermediary needed
4. Eliminates timeout issues for long-running operations (job agent)

**Relevant files**:

- `src/lib/graphql-client.ts` - Client configuration with read/write key support
- `src/middleware.ts` - Verifies the clang-auth cookie for admin access

### Astro Pages vs React Components

**Public pages** (static):

```astro
---
// src/pages/skills.astro
import BaseLayout from '../layouts/BaseLayout.astro';
import SkillCard from '../components/SkillCard.astro';
// No `export const prerender` = static by default
---
<BaseLayout title="Skills">
  <SkillCard skill={skill} />
</BaseLayout>
```

**Admin pages** (SSR with React):

```astro
---
// src/pages/admin/skills/index.astro
export const prerender = false; // Enable SSR
import AdminLayout from '../../../layouts/AdminLayout.astro';
import { SkillsList } from '../../../components/admin/lists';
---
<AdminLayout title="Skills | Admin">
  <SkillsList client:only="react" />
</AdminLayout>

```

### React Component Pattern

Admin React components follow this pattern:

```tsx
// src/components/admin/forms/SkillsForm.tsx
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { Skill } from "../../../lib/types";
import { Button, Input, Select, Card, CardHeader } from "../ui";

interface SkillsFormProps {
  initialData?: Skill;
  onSubmit: (data: Partial<Skill>) => Promise<void>;
  onCancel: () => void;
}

export default function SkillsForm({
  initialData,
  onSubmit,
  onCancel,
}: SkillsFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      /* ... */
    },
  });
  // ...
}
```

### Netlify Functions (ES Modules)

Functions use ES module syntax:

```javascript
// netlify/functions/my-admin-function.js
import { requireAdmin } from "../../src/lib/server/clang-auth";

export const handler = async (event) => {
  // clang-auth cookie + admin grant; POST/PUT/PATCH/DELETE also need a same-origin Origin
  const auth = await requireAdmin(event);
  if (!auth.ok) return auth.response;

  // auth.user = { sub, email, name, roles }; forward auth.token as
  // `Authorization: Bearer` when calling the GraphQL API.
  // Same-origin only: no CORS headers. Call it from the browser with authFetch().
};
```

### Authentication Flow

1. `src/middleware.ts` verifies the clang-auth `ca_access` cookie on every `/admin/*` request (ES256 via JWKS, `apps.portfolio` ∋ `admin`)
2. Signed out/expired → 302 to `${AUTH_BASE_URL}/login?redirect_uri=…`; no grant → 403 page
3. Admin pages need no client-side auth check; `Astro.locals.user` holds the user
4. Browser requests use `authFetch()` / `createWriteClient()`, which refresh the 15-minute token on 401 and retry
5. Sign out calls clang-auth `/logout` (signs out of every app on the domain)

Details: `docs/auth-flow-diagram.md`.

### Data Types

Key interfaces in `src/lib/types.ts`:

```typescript
interface Experience {
  _id: string;
  company: string;
  title: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  responsibilities: string[];
  achievements: Achievement[];
  technologies: string[];
  roleTypes: RoleType[];
}

interface Skill {
  _id: string;
  name: string;
  category: string;
  level: "beginner" | "intermediate" | "advanced" | "expert";
  yearsOfExperience: number;
  featured: boolean;
  iconName?: string;
  roleTypes: RoleType[];
}

interface Project {
  _id: string;
  name: string;
  type: ProjectType;
  overview: string;
  technologies: string[];
  roleTypes: RoleType[];
  links: ProjectLink[];
  featured: boolean;
}

type RoleType =
  | "software_engineer"
  | "engineering_manager"
  | "technical_writer"
  | "technical_writing_manager";
type ProjectType =
  | "technical_writing"
  | "software_engineering"
  | "leadership"
  | "hybrid";
```

## Styling

### Tailwind Dark Theme

The site uses a custom dark theme defined in `tailwind.config.mjs`:

```javascript
colors: {
  dark: {
    base: '#0d1117',      // Page background
    card: '#161b22',      // Card background
    layer: '#21262d',     // Input backgrounds
    border: '#30363d',    // Borders
    hover: '#2d333b',     // Hover states
  },
  text: {
    primary: '#e6edf3',   // Main text
    secondary: '#8b949e', // Muted text
    muted: '#6e7681',     // Very muted
  },
  accent: {
    blue: '#58a6ff',      // Primary accent
    green: '#3fb950',     // Success
    amber: '#d29922',     // Warning
    red: '#f85149',       // Error
    purple: '#a371f7',    // Purple accent
    pink: '#db61a2',      // Pink accent
  }
}
```

### Common Patterns

```tsx
// Card
<div className="bg-dark-card border border-dark-border rounded-lg p-6">

// Input
<input className="w-full px-4 py-2 bg-dark-layer border border-dark-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-blue" />

// Button primary
<button className="px-4 py-2 bg-accent-blue hover:bg-accent-blue/80 text-white rounded-lg transition-colors">

// Button secondary
<button className="px-4 py-2 bg-dark-layer border border-dark-border text-text-primary rounded-lg hover:bg-dark-hover transition-colors">
```

## Environment Variables

| Variable | Purpose | Required |
| --- | --- | --- |
| `GRAPHQL_ENDPOINT` | GraphQL API URL (server-side) | Yes |
| `GRAPHQL_API_KEY` | GraphQL API key (server-side) | Yes |
| `AUTH_BASE_URL` | clang-auth base URL (server) | Yes |
| `PUBLIC_AUTH_BASE_URL` | clang-auth base URL (browser, build time) | Yes |
| `AUTH_APP_SLUG` | App slug in the token's `apps` claim (`portfolio`) | Yes |
| `APP_ORIGIN` | Canonical site origin (redirects, CSRF check) | Yes |
| `ANTHROPIC_API_KEY` | Claude API key for AI features | Yes (for Job Agent and AI chat features) |

Tests: `npm test` (vitest; `src/**/__tests__`)

## Local Development Notes

- **Port 8080**: Netlify Dev proxy (use this for full functionality)
- **Port 4321**: Direct Astro (no functions)
- **Port 8888**: GraphQL service (must run separately)
- **Port 9999**: Netlify Functions direct

Functions only work through the Netlify Dev proxy (port 8080).

## Common Tasks

### Adding a new admin page

1. Create Astro page in `src/pages/admin/`:

```astro
---
export const prerender = false;
import AdminLayout from "../../layouts/AdminLayout.astro";
import { MyComponent } from "../../components/admin/pages";
---
<AdminLayout title="Page Title | Admin">
  <MyComponent client:only="react" />
</AdminLayout>

```

2. Create React component in `src/components/admin/pages/`
3. Export from `src/components/admin/pages/index.ts`

### Adding a new form

1. Create form component in `src/components/admin/forms/`
2. Use `react-hook-form` for state management
3. Use UI components from `../ui`
4. Follow existing form patterns (see `SkillsForm.tsx`, `ProjectForm.tsx`)
5. Export from `src/components/admin/forms/index.ts`

### Adding a new Netlify function

1. Create `netlify/functions/my-function.js`
2. Use ES module syntax (`import`/`export`)
3. Include CORS headers
4. Handle OPTIONS preflight
5. Add auth check if needed (see `ai-assistant.js`)

## GraphQL Queries

The GraphQL client is in `src/lib/graphql-client.ts`. Example usage:

```typescript
import { graphqlClient, QUERIES } from "../lib/graphql-client";

const data = await graphqlClient.request(QUERIES.GET_EXPERIENCES);
```

## AI Integration

The AI assistant (`netlify/functions/ai-assistant.js`) proxies requests to Claude API with career context. Used by:

- `AIChatPanel.tsx`: Floating chat for content assistance
- `ResumeGenerator.tsx`: Job-tailored resume generation
- `CoverLetterGenerator.tsx`: Cover letter generation

Prompts are defined in `src/lib/job-agent-prompts.ts`.
