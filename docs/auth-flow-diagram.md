# Authentication & Request Flow Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         Portfolio Site (Netlify)                         │
│                      https://clintonlangosch.com                         │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ Proxies GraphQL requests
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    GraphQL API (AWS Lambda)                              │
│                   Different domain/deployment                            │
└─────────────────────────────────────────────────────────────────────────┘
```

## 1. Unauthenticated Frontend Requests (Public Site)

**Flow**: Public pages → React component → GraphQL proxy → API (read-only)

```
┌──────────────┐
│   Browser    │
│  (Visitor)   │
└──────┬───────┘
       │
       │ 1. GET /skills
       │
       ▼
┌──────────────────────────────────────────────────────────┐
│  skills.astro (Static Astro page)                        │
│  - Renders PageHeader                                    │
│  - Renders <SkillsPageContent client:only="react" />    │
└──────────────────┬───────────────────────────────────────┘
                   │
                   │ 2. React component hydrates
                   │
                   ▼
┌──────────────────────────────────────────────────────────┐
│  SkillsPageContent.tsx                                   │
│  - useEffect(() => fetchSkills())                        │
│  - const client = getGraphQLClient()                     │
│  - client.request(SKILLS_QUERY)                          │
└──────────────────┬───────────────────────────────────────┘
                   │
                   │ 3. POST /.netlify/functions/graphql-proxy
                   │    Body: { query: "query { skills { ... } }" }
                   │    credentials: 'include'
                   │    (No auth_token cookie - visitor not logged in)
                   │
                   ▼
┌──────────────────────────────────────────────────────────┐
│  graphql-proxy.js                                        │
│  1. No auth_token cookie found                           │
│  2. Build headers:                                       │
│     - X-API-Key: GRAPHQL_API_KEY                         │
│     - NO Authorization header (no token)                 │
│  3. Forward to GRAPHQL_ENDPOINT                          │
└──────────────────┬───────────────────────────────────────┘
                   │
                   │ 4. POST https://api.example.com/graphql
                   │    X-API-Key: <key>
                   │    Body: { query: "query { skills { ... } }" }
                   │
                   ▼
┌──────────────────────────────────────────────────────────┐
│  GraphQL API (AWS Lambda)                                │
│  src/middleware/auth.ts                                  │
│                                                           │
│  1. Validate X-API-Key ✓                                 │
│  2. Check if mutation? NO (it's a query)                 │
│  3. JWT not required for queries                         │
│  4. Execute query, return skills data                    │
└──────────────────┬───────────────────────────────────────┘
                   │
                   │ 5. Response: { data: { skills: [...] } }
                   │
                   ▼
┌──────────────────────────────────────────────────────────┐
│  SkillsPageContent.tsx                                   │
│  - setSkills(data.skills)                                │
│  - Renders skill cards with data                         │
└──────────────────────────────────────────────────────────┘
```

**Key Points**:
- Public pages use **React components** that fetch data at runtime
- GraphQL **queries** (read-only) don't require JWT authentication
- Only **API key** is required (added by proxy)
- Visitors never see the API key (server-side only in proxy)
- Same GraphQL proxy used for both public and admin requests

---

## 2. Admin Login Flow

**Flow**: Login form → Netlify Function → JWT cookie set

```
┌──────────────┐
│   Browser    │
│   (Admin)    │
└──────┬───────┘
       │
       │ 1. Navigate to /admin/login
       │
       ▼
┌────────────────────────────────────────────────────────────┐
│  LoginForm.tsx                                             │
│  - User enters username/password                           │
│  - Calls auth.login(username, password)                    │
└────────────────────┬───────────────────────────────────────┘
                     │
                     │ 2. POST /.netlify/functions/auth-login
                     │    Body: { username, password }
                     │    credentials: 'include'
                     │
                     ▼
┌────────────────────────────────────────────────────────────┐
│  auth-login.js (Netlify Function)                          │
│                                                             │
│  1. Validate username === ADMIN_USERNAME                   │
│  2. bcrypt.compare(password, ADMIN_PASSWORD_HASH)          │
│  3. Generate JWT:                                          │
│     jwt.sign({ username, iat }, AUTH_SECRET, { 24h })      │
│  4. Set HTTP-only cookie:                                  │
│     Set-Cookie: auth_token=<JWT>;                          │
│                 HttpOnly; Secure; SameSite=Lax;            │
│                 Path=/; Max-Age=86400                      │
│  5. Return: { success: true, user: { username } }          │
└────────────────────┬───────────────────────────────────────┘
                     │
                     │ 3. Response with Set-Cookie header
                     │
                     ▼
┌────────────────────────────────────────────────────────────┐
│  Browser                                                    │
│  - Stores auth_token cookie (HTTP-only, can't access JS)  │
│  - Redirects to /admin                                     │
└────────────────────────────────────────────────────────────┘
```

**Security Features**:
- Password stored as bcrypt hash in `ADMIN_PASSWORD_HASH` env var
- JWT signed with `AUTH_SECRET` (64-char hex)
- Cookie is **HTTP-only** (JavaScript cannot access)
- Cookie is **Secure** in production (HTTPS only)
- Cookie is **SameSite=Lax** (CSRF protection)
- Token expires in 24 hours

---

## 3. Admin Page Access (Server-Side Auth Check)

**Flow**: Request admin page → Middleware validates cookie → Allow/Deny

```
┌──────────────┐
│   Browser    │
│   (Admin)    │
└──────┬───────┘
       │
       │ 1. GET /admin/skills
       │    Cookie: auth_token=<JWT>
       │
       ▼
┌────────────────────────────────────────────────────────────┐
│  src/middleware.ts (Astro Middleware)                      │
│                                                             │
│  1. Check if path starts with /admin (except /admin/login) │
│  2. Extract auth_token from cookies                        │
│  3. If no token → redirect('/admin/login')                 │
│  4. Verify token:                                          │
│     POST /.netlify/functions/auth-verify                   │
│     Body: { token }                                        │
│  5. If invalid → redirect('/admin/login')                  │
│  6. If valid → next() (continue to page)                   │
└────────────────────┬───────────────────────────────────────┘
                     │
                     │ 2. Token valid, continue
                     │
                     ▼
┌────────────────────────────────────────────────────────────┐
│  Admin Page (SSR)                                          │
│  - src/pages/admin/skills/index.astro                      │
│  - export const prerender = false (SSR enabled)            │
│  - Renders AdminLayout with React component                │
│  - <SkillsList client:only="react" />                      │
└────────────────────┬───────────────────────────────────────┘
                     │
                     │ 3. HTML response
                     │
                     ▼
┌────────────────────────────────────────────────────────────┐
│  Browser                                                    │
│  - Page loads                                              │
│  - Client-side auth check runs (see next section)          │
└────────────────────────────────────────────────────────────┘
```

**Two-Layer Auth**:
1. **Server-side** (middleware): Validates token before rendering page
2. **Client-side** (script): Additional check after page loads (see below)

---

## 4. Client-Side Auth Check (After Page Load)

**Flow**: Page loads → Script verifies token → Stay/Redirect

```
┌────────────────────────────────────────────────────────────┐
│  Admin Page HTML                                           │
│  <script>                                                  │
│    import { verifyToken } from "../../../lib/auth";        │
│    async function checkAuth() {                            │
│      const result = await verifyToken();                   │
│      if (!result.valid)                                    │
│        window.location.href = "/admin/login";              │
│    }                                                       │
│    checkAuth();                                            │
│  </script>                                                 │
└────────────────────┬───────────────────────────────────────┘
                     │
                     │ POST /.netlify/functions/auth-verify
                     │ credentials: 'include' (sends cookie)
                     │
                     ▼
┌────────────────────────────────────────────────────────────┐
│  auth-verify.js (Netlify Function)                         │
│                                                             │
│  1. Extract auth_token from cookies                        │
│  2. jwt.verify(token, AUTH_SECRET)                         │
│  3. Return: { valid: true/false, user: { username } }     │
└────────────────────┬───────────────────────────────────────┘
                     │
                     │ Response: { valid: true }
                     │
                     ▼
┌────────────────────────────────────────────────────────────┐
│  Browser                                                    │
│  - Token valid, stay on page                               │
│  - React components hydrate                                │
└────────────────────────────────────────────────────────────┘
```

**Why Two Checks?**
- **Middleware**: Prevents unauthorized page rendering (server-side)
- **Client script**: Catches expired tokens after page load (client-side)

---

## 5. Admin Data Mutations (GraphQL via Proxy)

**Flow**: React form → GraphQL proxy → External API

```
┌──────────────┐
│   Browser    │
│   (Admin)    │
└──────┬───────┘
       │
       │ 1. User submits form (add/edit skill)
       │
       ▼
┌────────────────────────────────────────────────────────────┐
│  SkillsForm.tsx (React Component)                          │
│  - User fills form                                         │
│  - onSubmit calls GraphQL mutation                         │
│  - Uses graphqlClient from src/lib/graphql-client.ts       │
└────────────────────┬───────────────────────────────────────┘
                     │
                     │ 2. GraphQL mutation request
                     │    POST /.netlify/functions/graphql-proxy
                     │    Cookie: auth_token=<JWT>
                     │    credentials: 'include'
                     │    Body: { query: "mutation { ... }" }
                     │
                     ▼
┌────────────────────────────────────────────────────────────┐
│  graphql-proxy.js (Netlify Function)                       │
│                                                             │
│  1. Extract auth_token from cookies                        │
│  2. Verify JWT: jwt.verify(token, AUTH_SECRET)             │
│  3. Build headers for GraphQL API:                         │
│     - Content-Type: application/json                       │
│     - X-API-Key: GRAPHQL_API_KEY (from env)                │
│     - Authorization: Bearer <JWT> (from cookie)            │
│  4. Forward request to GRAPHQL_ENDPOINT                    │
│  5. Return response to client                              │
└────────────────────┬───────────────────────────────────────┘
                     │
                     │ 3. Proxied request
                     │    POST https://api.example.com/graphql
                     │    X-API-Key: <key>
                     │    Authorization: Bearer <JWT>
                     │    Body: { query: "mutation { ... }" }
                     │
                     ▼
┌────────────────────────────────────────────────────────────┐
│  GraphQL API (AWS Lambda - Different Domain)               │
│  src/middleware/auth.ts                                    │
│                                                             │
│  1. Validate X-API-Key === API_ACCESS_KEY                  │
│     - Required for ALL requests                            │
│     - Returns 401 if missing/invalid                       │
│                                                             │
│  2. Check if request is mutation:                          │
│     - isMutationRequest(body) checks for "mutation"        │
│                                                             │
│  3. If mutation, validate JWT:                             │
│     - Extract Authorization: Bearer <token>                │
│     - jwt.verify(token, AUTH_SECRET)                       │
│     - Returns 401 if missing/invalid                       │
│                                                             │
│  4. If query (not mutation):                               │
│     - Only API key required                                │
│     - No JWT needed                                        │
│                                                             │
│  5. Execute GraphQL operation                              │
│  6. Return result                                          │
└────────────────────┬───────────────────────────────────────┘
                     │
                     │ 4. GraphQL response
                     │
                     ▼
┌────────────────────────────────────────────────────────────┐
│  graphql-proxy.js                                          │
│  - Forwards response back to client                        │
└────────────────────┬───────────────────────────────────────┘
                     │
                     │ 5. Response
                     │
                     ▼
┌────────────────────────────────────────────────────────────┐
│  SkillsForm.tsx                                            │
│  - Receives response                                       │
│  - Updates UI                                              │
│  - Shows success/error message                             │
└────────────────────────────────────────────────────────────┘
```

---

## 6. Why GraphQL Proxy is Needed

**Problem**: Cross-domain cookie restrictions

```
❌ WITHOUT PROXY (Doesn't work):

Browser (clintonlangosch.com)
    │
    │ POST https://api.example.com/graphql
    │ Cookie: auth_token=<JWT>
    │
    ▼
GraphQL API (api.example.com)
    │
    └─ ❌ Browser won't send cookies cross-domain!
       ❌ No Authorization header
       ❌ Request fails authentication
```

```
✅ WITH PROXY (Works):

Browser (clintonlangosch.com)
    │
    │ POST /.netlify/functions/graphql-proxy
    │ Cookie: auth_token=<JWT>  ← Same domain, cookie sent!
    │
    ▼
Proxy (clintonlangosch.com)
    │ Extracts cookie
    │ Adds Authorization: Bearer <JWT>
    │
    │ POST https://api.example.com/graphql
    │ Authorization: Bearer <JWT>  ← Now has auth!
    │
    ▼
GraphQL API (api.example.com)
    │
    └─ ✅ Receives Authorization header
       ✅ Validates JWT
       ✅ Executes mutation
```

---

## 7. GraphQL API Authentication Rules

The external GraphQL API (`src/middleware/auth.ts`) enforces:

### All Requests (Queries + Mutations)
```
REQUIRED: X-API-Key header
- Must match API_ACCESS_KEY env var
- Returns 401 if missing/invalid
```

### Mutations Only
```
REQUIRED: Authorization: Bearer <JWT>
- JWT must be valid (signed with AUTH_SECRET)
- Returns 401 if missing/invalid
```

### Queries (Read-only)
```
OPTIONAL: Authorization header
- API key is sufficient
- JWT not required for queries
```

**Detection Logic**:
```javascript
function isMutationRequest(body) {
  const query = body.query || body.mutation || "";
  return (
    query.trim().startsWith("mutation") ||
    query.includes("mutation ") ||
    query.includes("mutation{")
  );
}
```

---

## 8. Complete Authentication Summary

### Credentials Storage
| Credential | Location | Format |
|------------|----------|--------|
| Admin password | `ADMIN_PASSWORD_HASH` env var | bcrypt hash |
| JWT secret | `AUTH_SECRET` env var | 64-char hex |
| GraphQL API key | `GRAPHQL_API_KEY` env var | String |
| GraphQL API key (API side) | `API_ACCESS_KEY` env var | String (must match) |

### Token Flow
```
1. Login → JWT generated → Stored in HTTP-only cookie
2. Admin page request → Cookie sent automatically → Middleware validates
3. GraphQL mutation → Cookie sent to proxy → Proxy adds to Authorization header
4. GraphQL API → Validates API key + JWT → Executes mutation
```

### Security Layers
1. **HTTP-only cookie**: JavaScript cannot access token
2. **Secure flag**: HTTPS only in production
3. **SameSite=Lax**: CSRF protection
4. **JWT expiration**: 24-hour lifetime
5. **Server-side validation**: Middleware checks before rendering
6. **Client-side validation**: Script checks after page load
7. **API key**: Required for all GraphQL requests
8. **JWT for mutations**: Required for data modifications

---

## 9. Environment Variables

### Portfolio Site (Netlify)
```bash
# GraphQL API (server-side only, not exposed to client)
GRAPHQL_ENDPOINT=https://api.example.com/graphql
GRAPHQL_API_KEY=<api-key>

# Admin Auth
AUTH_SECRET=<64-char-hex>
ADMIN_USERNAME=<username>
ADMIN_PASSWORD_HASH=<bcrypt-hash>

# AI (optional)
ANTHROPIC_API_KEY=<key>
```

### GraphQL API (AWS Lambda)
```bash
# API Authentication
API_ACCESS_KEY=<api-key>  # Must match GRAPHQL_API_KEY above
AUTH_SECRET=<64-char-hex>  # Must match portfolio site AUTH_SECRET
```

---

## 10. Key Files Reference

### Portfolio Site
```
netlify/functions/
├── auth-login.js          # Login, set JWT cookie
├── auth-verify.js         # Verify JWT from cookie
├── auth-logout.js         # Clear cookie
└── graphql-proxy.js       # Proxy GraphQL, add auth header

src/
├── middleware.ts          # Server-side auth check
├── lib/
│   ├── auth.ts           # Client auth utilities
│   └── graphql-client.ts # GraphQL client (points to proxy)
└── components/admin/     # React admin components
```

### GraphQL API
```
src/
└── middleware/
    └── auth.ts           # API key + JWT validation
```
