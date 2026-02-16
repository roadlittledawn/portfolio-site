# Authentication & Request Flow Architecture

## System Overview

```mermaid
graph TB
    Portfolio["Portfolio Site (Netlify)<br/>https://clintonlangosch.com"]
    API["GraphQL API (AWS Lambda)<br/>Different domain/deployment"]
    
    Portfolio -->|Proxies GraphQL requests| API
    
    style Portfolio fill:#2d333b,stroke:#58a6ff,color:#e6edf3
    style API fill:#2d333b,stroke:#58a6ff,color:#e6edf3
```

## 1. Unauthenticated Frontend Requests (Public Site)

**Flow**: Public pages → React component → GraphQL proxy → API (read-only)

```mermaid
sequenceDiagram
    participant Browser as Browser<br/>(Visitor)
    participant Astro as skills.astro<br/>(Static Page)
    participant React as SkillsPageContent.tsx<br/>(React Component)
    participant Proxy as graphql-proxy.js<br/>(Netlify Function)
    participant API as GraphQL API<br/>(AWS Lambda)
    
    Browser->>Astro: 1. GET /skills
    Astro->>Browser: 2. HTML with React component
    Browser->>React: 3. Component hydrates
    React->>React: 4. useEffect(() => fetchSkills())
    React->>Proxy: 5. POST /.netlify/functions/graphql-proxy<br/>Body: { query: "query { skills {...} }" }<br/>credentials: 'include'<br/>(No auth_token cookie)
    
    Note over Proxy: No auth_token found<br/>Build headers:<br/>- X-API-Key: GRAPHQL_API_KEY<br/>- NO Authorization header
    
    Proxy->>API: 6. POST /graphql<br/>X-API-Key: <key><br/>Body: { query: "query { skills {...} }" }
    
    Note over API: auth.ts middleware:<br/>1. Validate X-API-Key ✓<br/>2. Check if mutation? NO<br/>3. JWT not required for queries<br/>4. Execute query
    
    API->>Proxy: 7. { data: { skills: [...] } }
    Proxy->>React: 8. Response
    React->>React: 9. setSkills(data.skills)
    React->>Browser: 10. Render skill cards
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

```mermaid
sequenceDiagram
    participant Browser as Browser<br/>(Admin)
    participant Form as LoginForm.tsx
    participant Login as auth-login.js<br/>(Netlify Function)
    
    Browser->>Form: 1. Navigate to /admin/login<br/>Enter username/password
    Form->>Login: 2. POST /.netlify/functions/auth-login<br/>Body: { username, password }<br/>credentials: 'include'
    
    Note over Login: 1. Validate username === ADMIN_USERNAME<br/>2. bcrypt.compare(password, ADMIN_PASSWORD_HASH)<br/>3. Generate JWT:<br/>jwt.sign({ username, iat }, AUTH_SECRET, { 24h })<br/>4. Set HTTP-only cookie:<br/>Set-Cookie: auth_token=<JWT>;<br/>HttpOnly; Secure; SameSite=Lax;<br/>Path=/; Max-Age=86400
    
    Login->>Browser: 3. Response with Set-Cookie header<br/>{ success: true, user: { username } }
    
    Note over Browser: Stores auth_token cookie<br/>(HTTP-only, can't access via JS)
    
    Browser->>Browser: 4. Redirect to /admin
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

```mermaid
sequenceDiagram
    participant Browser as Browser<br/>(Admin)
    participant Middleware as middleware.ts<br/>(Astro Middleware)
    participant Verify as auth-verify.js<br/>(Netlify Function)
    participant Page as Admin Page<br/>(SSR)
    
    Browser->>Middleware: 1. GET /admin/skills<br/>Cookie: auth_token=<JWT>
    
    Note over Middleware: Check path starts with /admin<br/>(except /admin/login)<br/>Extract auth_token from cookies
    
    alt No token
        Middleware->>Browser: redirect('/admin/login')
    else Has token
        Middleware->>Verify: 2. POST /.netlify/functions/auth-verify<br/>Body: { token }
        
        Note over Verify: jwt.verify(token, AUTH_SECRET)
        
        Verify->>Middleware: 3. { valid: true/false }
        
        alt Invalid token
            Middleware->>Browser: redirect('/admin/login')
        else Valid token
            Middleware->>Page: 4. Continue to page
            Page->>Browser: 5. HTML response<br/>(with React component)
        end
    end
```

**Two-Layer Auth**:
1. **Server-side** (middleware): Validates token before rendering page
2. **Client-side** (script): Additional check after page loads (see next section)

---

## 4. Client-Side Auth Check (After Page Load)

**Flow**: Page loads → Script verifies token → Stay/Redirect

```mermaid
sequenceDiagram
    participant Browser as Browser
    participant Script as Admin Page Script
    participant Auth as auth.ts<br/>(verifyToken)
    participant Verify as auth-verify.js<br/>(Netlify Function)
    
    Browser->>Script: 1. Page loads, script executes
    Script->>Auth: 2. checkAuth() calls verifyToken()
    Auth->>Verify: 3. POST /.netlify/functions/auth-verify<br/>credentials: 'include' (sends cookie)
    
    Note over Verify: Extract auth_token from cookies<br/>jwt.verify(token, AUTH_SECRET)
    
    Verify->>Auth: 4. { valid: true/false, user: {...} }
    
    alt Invalid token
        Auth->>Browser: 5. window.location.href = "/admin/login"
    else Valid token
        Auth->>Script: 5. Token valid
        Script->>Browser: 6. Stay on page, React components hydrate
    end
```

**Why Two Checks?**
- **Middleware**: Prevents unauthorized page rendering (server-side)
- **Client script**: Catches expired tokens after page load (client-side)

---

## 5. Admin Data Mutations (GraphQL via Proxy)

**Flow**: React form → GraphQL proxy → External API

```mermaid
sequenceDiagram
    participant Browser as Browser<br/>(Admin)
    participant Form as SkillsForm.tsx<br/>(React Component)
    participant Client as graphql-client.ts
    participant Proxy as graphql-proxy.js<br/>(Netlify Function)
    participant API as GraphQL API<br/>(AWS Lambda)
    
    Browser->>Form: 1. User submits form (add/edit skill)
    Form->>Client: 2. onSubmit calls GraphQL mutation
    Client->>Proxy: 3. POST /.netlify/functions/graphql-proxy<br/>Cookie: auth_token=<JWT><br/>credentials: 'include'<br/>Body: { query: "mutation { ... }" }
    
    Note over Proxy: 1. Extract auth_token from cookies<br/>2. Verify JWT: jwt.verify(token, AUTH_SECRET)<br/>3. Build headers:<br/>- Content-Type: application/json<br/>- X-API-Key: GRAPHQL_API_KEY<br/>- Authorization: Bearer <JWT>
    
    Proxy->>API: 4. POST /graphql<br/>X-API-Key: <key><br/>Authorization: Bearer <JWT><br/>Body: { query: "mutation { ... }" }
    
    Note over API: auth.ts middleware:<br/>1. Validate X-API-Key ✓<br/>2. Check if mutation? YES<br/>3. Validate JWT ✓<br/>4. Execute mutation
    
    API->>Proxy: 5. { data: { ... } }
    Proxy->>Client: 6. Response
    Client->>Form: 7. Update UI
    Form->>Browser: 8. Show success message
```

---

## 6. CORS Configuration

### Why CORS Matters

The GraphQL proxy must handle CORS because:
1. Browser enforces same-origin policy for fetch requests
2. Preflight OPTIONS requests must be handled
3. Credentials (cookies) require explicit CORS headers

### Proxy CORS Headers

```javascript
// netlify/functions/graphql-proxy.js
const headers = {
  'Access-Control-Allow-Origin': allowedOrigin,  // Dynamic based on request
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Credentials': 'true',  // Required for cookies!
};
```

### Origin Validation

```mermaid
flowchart TD
    Request[Incoming Request] --> CheckOrigin{Origin in<br/>allowed list?}
    
    CheckOrigin -->|Yes| SetOrigin[Set Access-Control-Allow-Origin<br/>to request origin]
    CheckOrigin -->|No, Production| Reject[403 Forbidden]
    CheckOrigin -->|No, Dev| Default[Use localhost:8080]
    
    SetOrigin --> Preflight{OPTIONS<br/>request?}
    Default --> Preflight
    
    Preflight -->|Yes| Return200[Return 200<br/>empty body]
    Preflight -->|No| Process[Process POST<br/>request]
    
    style Request fill:#2d333b,stroke:#58a6ff,color:#e6edf3
    style SetOrigin fill:#2d333b,stroke:#3fb950,color:#e6edf3
    style Reject fill:#2d333b,stroke:#f85149,color:#e6edf3
    style Default fill:#2d333b,stroke:#d29922,color:#e6edf3
    style Return200 fill:#2d333b,stroke:#3fb950,color:#e6edf3
    style Process fill:#2d333b,stroke:#3fb950,color:#e6edf3
```

**Allowed Origins**:
```javascript
const allowedOrigins = [
  'http://localhost:8080',      // Netlify Dev
  'http://localhost:4321',      // Astro direct
  'https://clintonlangosch.com', // Production
  process.env.URL,              // Deploy previews
];
```

### Critical CORS Settings

| Header | Value | Why |
|--------|-------|-----|
| `Access-Control-Allow-Credentials` | `true` | **Required** for browser to send cookies |
| `Access-Control-Allow-Origin` | Dynamic (from request) | Must match request origin when using credentials |
| `Access-Control-Allow-Headers` | `Content-Type, Authorization, X-API-Key` | Allows GraphQL headers |
| `Access-Control-Allow-Methods` | `POST, OPTIONS` | GraphQL uses POST, OPTIONS for preflight |

**Important**: When `Access-Control-Allow-Credentials: true`, you **cannot** use `Access-Control-Allow-Origin: *`. Must specify exact origin.

### Preflight Request Flow

```mermaid
sequenceDiagram
    participant Browser
    participant Proxy as graphql-proxy.js
    
    Note over Browser: Before actual request,<br/>browser sends preflight
    
    Browser->>Proxy: OPTIONS /.netlify/functions/graphql-proxy<br/>Origin: https://clintonlangosch.com<br/>Access-Control-Request-Method: POST<br/>Access-Control-Request-Headers: content-type
    
    Note over Proxy: Validate origin<br/>Return CORS headers
    
    Proxy->>Browser: 200 OK<br/>Access-Control-Allow-Origin: https://clintonlangosch.com<br/>Access-Control-Allow-Methods: POST, OPTIONS<br/>Access-Control-Allow-Headers: Content-Type, ...<br/>Access-Control-Allow-Credentials: true
    
    Note over Browser: Preflight passed,<br/>send actual request
    
    Browser->>Proxy: POST /.netlify/functions/graphql-proxy<br/>Cookie: auth_token=<JWT><br/>Body: { query: "..." }
    
    Proxy->>Browser: Response with same CORS headers
```

---

## 7. Why GraphQL Proxy is Needed

**Two Problems Solved**:
1. **Cross-domain cookies** - Browsers won't send cookies to different domains
2. **CORS with credentials** - Requires same-origin or explicit CORS configuration

```mermaid
graph TB
    subgraph "❌ WITHOUT PROXY (Doesn't work)"
        B1[Browser<br/>clintonlangosch.com]
        A1[GraphQL API<br/><api-domain>]
        
        B1 -->|POST /graphql<br/>Cookie: auth_token=JWT| A1
        A1 -.->|❌ Browser won't send<br/>cookies cross-domain!| B1
    end
    
    subgraph "✅ WITH PROXY (Works)"
        B2[Browser<br/>clintonlangosch.com]
        P2[Proxy<br/>clintonlangosch.com]
        A2[GraphQL API<br/><api-domain>]
        
        B2 -->|POST /.netlify/functions/graphql-proxy<br/>Cookie: auth_token=JWT<br/>✓ Same domain, cookie sent!| P2
        P2 -->|Extracts cookie<br/>Adds Authorization: Bearer JWT| P2
        P2 -->|POST /graphql<br/>Authorization: Bearer JWT<br/>✓ Now has auth!| A2
    end
    
    style B1 fill:#2d333b,stroke:#f85149,color:#e6edf3
    style A1 fill:#2d333b,stroke:#f85149,color:#e6edf3
    style B2 fill:#2d333b,stroke:#3fb950,color:#e6edf3
    style P2 fill:#2d333b,stroke:#3fb950,color:#e6edf3
    style A2 fill:#2d333b,stroke:#3fb950,color:#e6edf3
```

---

## 8. GraphQL API Authentication Rules

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

## 9. Complete Authentication Summary

### Credentials Storage
| Credential | Location | Format |
|------------|----------|--------|
| Admin password | `ADMIN_PASSWORD_HASH` env var | bcrypt hash |
| JWT secret | `AUTH_SECRET` env var | 64-char hex |
| GraphQL API key | `GRAPHQL_API_KEY` env var | String |
| GraphQL API key (API side) | `API_ACCESS_KEY` env var | String (must match) |

### Token Flow

```mermaid
flowchart LR
    Login[1. Login] --> JWT[2. JWT Generated]
    JWT --> Cookie[3. Stored in<br/>HTTP-only Cookie]
    Cookie --> Middleware[4. Middleware<br/>Validates]
    Middleware --> Mutation[5. GraphQL Mutation]
    Mutation --> Proxy[6. Proxy Extracts<br/>Cookie]
    Proxy --> Auth[7. Adds to<br/>Authorization Header]
    Auth --> API[8. API Validates<br/>API Key + JWT]
    API --> Execute[9. Executes<br/>Mutation]
    
    style Login fill:#2d333b,stroke:#58a6ff,color:#e6edf3
    style JWT fill:#2d333b,stroke:#58a6ff,color:#e6edf3
    style Cookie fill:#2d333b,stroke:#3fb950,color:#e6edf3
    style Middleware fill:#2d333b,stroke:#3fb950,color:#e6edf3
    style Mutation fill:#2d333b,stroke:#58a6ff,color:#e6edf3
    style Proxy fill:#2d333b,stroke:#58a6ff,color:#e6edf3
    style Auth fill:#2d333b,stroke:#3fb950,color:#e6edf3
    style API fill:#2d333b,stroke:#3fb950,color:#e6edf3
    style Execute fill:#2d333b,stroke:#3fb950,color:#e6edf3
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

## 10. Environment Variables

### Portfolio Site (Netlify)
```bash
# GraphQL API (server-side only, not exposed to client)
GRAPHQL_ENDPOINT=<graphql-api-url>
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

## 11. Key Files Reference

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
