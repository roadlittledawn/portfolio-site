# ADR-003: JWT as Second Authentication Factor for GraphQL Mutations

## Status
Accepted

## Context
The admin panel performs GraphQL mutations (create, update, delete career data) directly against the API using a write API key (`GRAPHQL_WRITE_KEY`). This key is the sole credential protecting mutation access. While the key is injected server-side by `AdminLayout.astro` (never bundled in static JS), it is still a long-lived static secret present in the browser's DOM for authenticated admin sessions.

If the write key were leaked through XSS, a compromised browser session, or any other client-side attack, an attacker could issue arbitrary mutations until the key is manually rotated. There is no expiration or per-session binding on the API key alone.

The admin already authenticates via JWT (stored as an HTTP-only `auth_token` cookie) to access admin pages. This JWT is short-lived (24h), signed with `AUTH_SECRET`, and validated by middleware before page render. However, this token was not forwarded to the GraphQL API — it only gated page access.

## Decision
Forward the admin JWT as a second authentication factor for GraphQL mutations:

1. **Portfolio site**: `AdminLayout.astro` reads the `auth_token` cookie and injects it into `window.__GRAPHQL_AUTH_TOKEN__` alongside the existing write key
2. **GraphQL client**: `createWriteClient()` sends both `X-API-Key` (write key) and `Authorization: Bearer <JWT>` headers
3. **GraphQL API**: `auth.ts` middleware verifies the JWT signature (via `AUTH_SECRET`) on all mutation requests, after the existing write-key check

Queries remain unchanged — only the read-only or write API key is required.

## Rationale

### Why two factors instead of one?
- **Defense in depth**: Neither credential alone is sufficient for mutations
- **Different lifetimes**: API key is long-lived (rotate manually); JWT expires in 24h
- **Different attack surfaces**: API key leaks via DOM/XSS; JWT is HTTP-only (harder to steal)
- **Minimal cost**: The JWT already exists — forwarding it adds negligible complexity

### Why not replace the API key with JWT entirely?
- Read-only queries still need the API key (no JWT available for public visitors)
- The two-tier key system (read/write) remains valuable for query-level access control
- Keeping both means a leaked JWT alone cannot perform mutations either

### What changes
- `AdminLayout.astro`: Reads cookie, injects `authToken` via `define:vars`
- `graphql-client.ts`: Adds conditional `Authorization` header in `createWriteClient()`
- `api-career-data/src/middleware/auth.ts`: Adds JWT verification step for mutations
- `api-career-data`: New `jsonwebtoken` dependency, `AUTH_SECRET` env var

### What does NOT change
- Login/logout/middleware flows
- Read-only client and public queries
- React admin components (client auto-detects context)
- Cookie handling (JWT remains HTTP-only; value is read server-side by Astro)

## Consequences

### Positive
- Leaked write key alone cannot perform mutations
- Expired sessions automatically lose mutation access (JWT expiry)
- No user-facing changes — transparent to admin workflow

### Negative
- `AUTH_SECRET` must be shared between portfolio site (Netlify) and API (Lambda)
- JWT expiry can cause mutation failures mid-session (mitigated by 24h lifetime matching session duration)
- Adds `jsonwebtoken` dependency to the API service

### Risks
- If `AUTH_SECRET` is not set in the API environment, mutations will fail with 500 (fail-closed)
- The `Authorization` header is conditional in the client — local dev without a JWT still works for queries but mutations will be rejected by the API
