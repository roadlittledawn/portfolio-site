# Portfolio Site

Personal portfolio site with integrated admin panel for managing career data.

[![Netlify Status](https://api.netlify.com/api/v1/badges/784104a7-d750-4a1a-b38f-17308981182b/deploy-status)](https://app.netlify.com/sites/clintonlangosch/deploys)

## Architecture

- **Framework**: Astro (hybrid SSR/static) + React Islands
- **Styling**: Tailwind CSS dark theme
- **Auth**: Cookie-based JWT via Netlify middleware
- **Data**: GraphQL proxy → external API (different domain)
- **AI**: Claude API proxy for resume/cover letter generation

```
portfolio-site/
├── src/
│   ├── components/        # Astro components (public site)
│   ├── components/admin/  # React components (admin UI)
│   ├── pages/            # Public pages (static)
│   ├── pages/admin/      # Admin pages (SSR)
│   ├── lib/              # Shared utilities, types, auth
│   ├── middleware.ts     # Cookie-based auth check
│   └── data/             # Cached career data JSON
├── netlify/functions/    # Auth, GraphQL proxy, AI proxy
└── scripts/              # Dev utilities
```

## Local Development

### Prerequisites

- Node.js 22+
- Netlify CLI (`npm i -g netlify-cli`)
- [Career Data GraphQL Service](https://github.com/roadlittledawn/career-data-graphql) running on port 8888

### Setup

1. Clone and install:

   ```bash
   git clone <repo-url>
   cd portfolio-site
   npm install
   ```

2. Generate auth secrets:

   ```bash
   npm run generate-secrets <your-password>
   ```

3. Create `.env` file:

   ```bash
   # GraphQL API - Server-side (required for proxy)
   GRAPHQL_ENDPOINT=http://localhost:4000/graphql
   GRAPHQL_API_KEY=<your-api-key>

   # Admin Auth
   AUTH_SECRET=<generated-secret>
   ADMIN_USERNAME=<your-username>
   ADMIN_PASSWORD_HASH=<generated-hash>

   # AI Assistant (optional)
   ANTHROPIC_API_KEY=<your-key>
   ```

4. Start the GraphQL service (separate terminal):

   ```bash
   cd ../career-data-graphql
   npm run dev
   ```

5. Start the dev server:

   ```bash
   npm run dev
   ```

6. Access:
   - Public site: http://localhost:8080
   - Admin panel: http://localhost:8080/admin

**Important**: Use port 8080 (Netlify Dev proxy), not 4321 (Astro direct). Functions only work through the proxy.

## Scripts

| Script                     | Description                           |
| -------------------------- | ------------------------------------- |
| `npm run dev`              | Start Netlify Dev (Astro + Functions) |
| `npm run dev:astro`        | Start Astro only (no functions)       |
| `npm run build`            | Production build                      |
| `npm run sync-data`        | Sync career data from GraphQL API     |
| `npm run generate-secrets` | Generate auth secrets                 |

## Deployment

Pushes to `main` auto-deploy to Netlify. Required env vars:

- `GRAPHQL_ENDPOINT` - GraphQL API URL (server-side)
- `GRAPHQL_API_KEY` - API key for GraphQL requests
- `AUTH_SECRET` - JWT signing secret
- `ADMIN_USERNAME` - Admin login username
- `ADMIN_PASSWORD_HASH` - Bcrypt password hash
- `ANTHROPIC_API_KEY` - Optional, for AI features

## Data Sync

Career data syncs automatically via GitHub Actions (weekly) or manually:

```bash
npm run sync-data
```

This fetches from the GraphQL API and updates `src/data/careerData.json`.
