# Plan: migrate portfolio admin auth to clang-auth

Status: proposed (2026-11-16). Reference implementation: Lexicon ([web-wtq PR #30](https://github.com/roadlittledawn/web-wtq/pull/30), `web-wtq/docs/PLAN.md`). General playbook: `service-clang-auth/docs/migrating-apps.md`.

This touches two repos: **portfolio-site** (this one) and **api-career-data** (the GraphQL API).

## Goal

Replace the Career Admin's single-user login (username + bcrypt hash in env vars, HS256 JWT signed with `AUTH_SECRET` in an `auth_token` cookie) with the shared clang-auth service at `https://auth.clintonlangosch.com`. Afterwards:

- You sign in once at `auth.clintonlangosch.com` and are signed in to the portfolio admin, Lexicon, and every other `*.clintonlangosch.com` app you have a grant for.
- Neither the site nor the API stores passwords or signing secrets. Both verify a short-lived ES256 token against clang-auth's public JWKS.
- Admin access means the token's `apps.portfolio` includes `"admin"`.
- Admin pages no longer put any key or token in page JavaScript. Today `AdminLayout.astro` injects both the GraphQL write key and the JWT into `window`.

## Terms

- **Slug.** The app's ID inside clang-auth. Lexicon's is `lexicon`; this site's will be `portfolio`. It is the name in `clang-auth app create portfolio`, the key in the token's `apps` claim (`"apps": { "portfolio": ["admin"] }`), and the value of `AUTH_APP_SLUG`. By convention it matches the subdomain, but the apex has none, so `portfolio` is just a name.
- **`ca_access`.** clang-auth's access-token cookie: an ES256 JWT, `Domain=.clintonlangosch.com`, `HttpOnly`, `Secure`, `SameSite=Lax`, valid for 15 minutes. Every host under `clintonlangosch.com` receives it.

## How it works after the change

```
browser (https://clintonlangosch.com)
  │  cookie ca_access (Domain=.clintonlangosch.com, HttpOnly, 15 min)
  │
  ├─► GET /admin/*                         Astro middleware (SSR)
  │       verify ES256 via JWKS, iss, exp, apps.portfolio ∋ "admin"
  │       missing/expired → 302 auth /login?redirect_uri=…  (silent if session alive)
  │       signed in, no grant → 403 page (no redirect, which would loop)
  │
  ├─► /.netlify/functions/ai-assistant, google-drive-*, google-oauth-*
  │       same check via requireAdmin(event); POSTs also check Origin
  ├─► /.netlify/functions/auth-me          → {email, name, roles} or 401 (UI state)
  │
  ├─► https://api.portfolio.clintonlangosch.com/graphql   (api-career-data)
  │       queries:   X-API-Key: <read key>               (unchanged)
  │       mutations: ca_access cookie (credentials: "include") + Origin allowlist
  │                  or Authorization: Bearer <ca_access> (server-to-server, from functions)
  │
  └─► https://auth.clintonlangosch.com
        /login?redirect_uri=…               sign in
        POST /api/session/refresh           new ca_access after the 15-min expiry
        POST /logout                        signs out of all apps
        /.well-known/jwks.json              public keys (fetched and cached by site + API)
```

## What changes and what doesn't

| | Before | After |
|---|---|---|
| Admin sign-in | `/admin/login` form → `auth-login` function | clang-auth `/login`; `/admin/login` just redirects there |
| Session cookie | `auth_token` (HS256, 24 h, host-only) | `ca_access` (ES256, 15 min, `.clintonlangosch.com`) |
| SSR check | `middleware.ts` → HTTP call to `auth-verify` | local JWKS verification in `middleware.ts` |
| Public pages | read key, no auth | **unchanged** |
| GraphQL queries | read key | **unchanged** |
| GraphQL mutations | write key + `Bearer` HS256 JWT, both in page JS | clang-auth token (cookie from browser, Bearer from functions) |
| API URL | `https://rndo54zjrsxy7ppxxobie7pgki0vlibt.lambda-url.us-west-2.on.aws/graphql` | `https://api.portfolio.clintonlangosch.com/graphql` (old URL kept until cleanup) |
| Secrets | `AUTH_SECRET`, `ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH`, `GRAPHQL_WRITE_KEY`, `API_WRITE_KEY` | none (just `AUTH_BASE_URL`, `AUTH_APP_SLUG`, `APP_ORIGIN`) |

## Being at the apex

The site is served at `clintonlangosch.com` (www 301s to it). The apex receives the `.clintonlangosch.com` cookie like any subdomain, so **the site doesn't move**. That skips the DNS, redirect and lost-localStorage steps of the general playbook. Things to keep in mind:

- **Canonical host.** `APP_ORIGIN` and the registered origin are `https://clintonlangosch.com`. If www ever becomes primary, change both, or register both origins.
- **Biggest trust surface on the domain.** The apex is the public, content-heavy site, and it receives the token for every app the user has. `ca_access` is HttpOnly, so an XSS bug can't read it, but it can send same-site requests that carry it. Keep sanitizing all rendered markdown and API content with `isomorphic-dompurify`, and never host third-party or user-uploaded HTML on the apex (migrating-apps.md §7 rule 1).
- **Keep the site's own cookies host-only.** Don't add `Domain=` to cookies the site sets, or every subdomain receives them.
- **CSRF.** Sibling apps (`lexicon.`, …) are *same-site* with the apex under `SameSite=Lax`, so the cookie alone doesn't prove a request came from this site. State-changing endpoints check `Origin`.
- **HSTS.** The apex sends `max-age=31536000` without `includeSubDomains`. Adding `includeSubDomains` belongs here, but only once every subdomain is HTTPS-only. Not part of this migration.

## Prerequisites (outside both repos)

1. **Register the app** in production clang-auth:

   ```sh
   clang-auth app create portfolio --name Portfolio --origin https://clintonlangosch.com
   clang-auth grant set <your-email> portfolio --role admin
   ```

2. **Netlify env vars** (production context), set alongside the existing ones:
   - `AUTH_BASE_URL=https://auth.clintonlangosch.com`
   - `PUBLIC_AUTH_BASE_URL=https://auth.clintonlangosch.com` (client code, baked in at build time)
   - `AUTH_APP_SLUG=portfolio`
   - `APP_ORIGIN=https://clintonlangosch.com`
   - `PUBLIC_GRAPHQL_ENDPOINT` / `GRAPHQL_ENDPOINT` switch to the new API host **in the same deploy as Part 2/3** (rollout step 3), not before.
3. **Lambda env vars** (`api-career-data`): `AUTH_BASE_URL=https://auth.clintonlangosch.com`, `AUTH_APP_SLUG=portfolio`, `ALLOWED_ADMIN_ORIGINS=https://clintonlangosch.com`. The function's config is managed by hand and includes Datadog variables added outside CI. `update-function-configuration --environment` **replaces the whole map**, so merge:

   ```sh
   FN=api-career-data; REGION=us-west-2
   aws lambda get-function-configuration --function-name $FN --region $REGION \
     --query 'Environment.Variables' > env.json
   jq '. + {AUTH_BASE_URL:"https://auth.clintonlangosch.com", AUTH_APP_SLUG:"portfolio",
            ALLOWED_ADMIN_ORIGINS:"https://clintonlangosch.com"}' env.json \
     | jq '{Variables: .}' > env-new.json
   aws lambda update-function-configuration --function-name $FN --region $REGION \
     --environment file://env-new.json
   rm env.json env-new.json   # contains secrets
   ```

4. **Outbound access for JWKS.** The Lambda must reach `https://auth.clintonlangosch.com/.well-known/jwks.json`. That's true for a function outside a VPC. Check with `aws lambda get-function-configuration --query VpcConfig`.

## Part 1: api-career-data

### 1a. Code

| Step | Change |
|---|---|
| 1.1 | **Fix mutation detection first.** `isMutationRequest` in `api/middleware/auth.ts` string-matches the query text, so a mutation preceded by a comment or fragment (`"# x\nmutation\n{…}"`) isn't detected, and the read key could run it. Replace it with `graphql`'s `parse()` and treat the request as a mutation if any `OperationDefinition` has `operation === "mutation"`. Reject unparsable bodies with 400. Ship this regardless of the rest. |
| 1.2 | Add `jose`. New `api/middleware/clang-auth.ts`, a port of `web-wtq/lib/clang-auth.ts`: `verifyAccessToken(token, authBaseUrl)` using `createRemoteJWKSet` (cached per Lambda instance, re-fetched on unknown `kid`), `algorithms: ["ES256"]`, `issuer: AUTH_BASE_URL`, `clockTolerance: 30`; `readCookie`; `setJwksForTesting`. |
| 1.3 | Mutation auth in `authMiddleware`. Take the token from the `ca_access` cookie, or else from `Authorization: Bearer`. Verify it, then require `apps[AUTH_APP_SLUG]` to include `"admin"` (403 otherwise). **If the token came from the cookie**, also require `Origin` (or `Referer` when `Origin` is missing) to be in `ALLOWED_ADMIN_ORIGINS`, since sibling subdomains are same-site. Keep the existing GraphQL error shape (`errors[].extensions.code` `UNAUTHENTICATED` / `FORBIDDEN`) so the frontend's handling still works. |
| 1.4 | **Dual mode** during the transition. While `AUTH_SECRET` is set, also accept the legacy pair (write key + HS256 Bearer). Try ES256 first, and only fall back to HS256 if the token's header says `alg: HS256`. Log which path was used, so step 4 of the rollout can confirm nothing still uses legacy. Queries are unchanged: read or write key. Mutations no longer *require* the write key when a valid clang-auth admin token is present. |
| 1.5 | CORS in `api/server.ts`: keep `credentials: true` and the exact-origin list (`https://clintonlangosch.com`, writing-samples for reads). Allowed headers must include `X-API-Key`, `Authorization` and `Content-Type`. Don't use `*` with credentials. |
| 1.6 | Tests (vitest): sign tokens with a throwaway ES256 key and verify via `createLocalJWKSet`. Cover a valid admin token by cookie and by Bearer, missing token, expired, wrong `iss`, unknown `kid`, `alg: none`, HS256 token rejected once `AUTH_SECRET` is unset, no grant (403), non-admin role (403), cookie mutation with a bad `Origin` (403), with no `Origin` but a good `Referer` (ok), with neither (403), and a Bearer mutation without `Origin` (ok). Add mutation-detection cases: comment first, fragment first, multiple operations, shorthand query. |

### 1b. Custom domain: `api.portfolio.clintonlangosch.com`

A Lambda function URL can't take a custom domain itself, so CloudFront goes in front of it. The Lambda, its code and its event format don't change, and the old function URL keeps working, which is the rollback path. (`career-api.clintonlangosch.com` works equally well as a name. The API also serves writing-samples and the career-data MCP, if you'd rather it not say "portfolio".)

| Step | Change |
|---|---|
| 1.7 | ACM certificate for `api.portfolio.clintonlangosch.com` **in `us-east-1`** (CloudFront requires it). DNS validation: add the `CNAME` ACM shows in Netlify DNS. |
| 1.8 | CloudFront distribution. Origin: the function URL's host (`rndo54zjrsxy7ppxxobie7pgki0vlibt.lambda-url.us-west-2.on.aws`), HTTPS only. Alternate domain name plus the cert. Viewer protocol: redirect to HTTPS. Allowed methods: all (GET, HEAD, OPTIONS, PUT, POST, PATCH, DELETE). Cache policy `CachingDisabled`. Origin request policy `AllViewerExceptHostHeader`, so `Cookie`, `Origin`, `Authorization` and `X-API-Key` reach Lambda, and the `Host` header stays the function URL's, which it requires. |
| 1.9 | Netlify DNS: `CNAME api.portfolio → <distribution>.cloudfront.net`. |
| 1.10 | Smoke test through the new host: `curl -s https://api.portfolio.clintonlangosch.com/graphql -H 'X-API-Key: <read>' -H 'Content-Type: application/json' -d '{"query":"{ __typename }"}'`. Then make a mutation with a cookie (`-H "Cookie: ca_access=$TOKEN" -H 'Origin: https://clintonlangosch.com'`), using a token copied from devtools. |

## Part 2: portfolio-site backend

| Step | Change |
|---|---|
| 2.1 | Add `jose`. New `src/lib/server/clang-auth.ts`, a port of `web-wtq/lib/clang-auth.ts` (`verifyAccessToken`, `readCookie`, `originOf`, `setJwksForTesting`, `authSettings()`), plus `requireAdmin(event)` for Netlify functions. It returns `{ user }` or a ready `401`/`403` response, and for `POST/PUT/PATCH/DELETE` it checks `Origin`/`Referer` against `APP_ORIGIN`. The Astro middleware and the functions both import it (the functions are bundled by esbuild, which handles the TS import). |
| 2.2 | Rewrite `src/middleware.ts`. For `/admin/*`, read `ca_access` and verify locally: no more `fetch` to `auth-verify`. Missing or invalid token: `302` to `${AUTH_BASE_URL}/login?redirect_uri=<full URL>`. Valid without `admin`: render a 403 "no access" response. Store claims in `context.locals.user`. Drop the `/admin/login` exemption, since that page becomes a redirect too. Set `Cache-Control: no-store` on admin responses. |
| 2.3 | New function `auth-me`: returns `{ email, name, roles }` from a valid token, or `401`. The admin UI uses it for "Signed in as …". |
| 2.4 | Replace each `jwt.verify(auth_token, AUTH_SECRET)` with `requireAdmin(event)` in `ai-assistant.js` (its `username === ADMIN_USERNAME` check becomes the grant check), `google-drive-status.js`, `google-oauth-init.js` and `google-drive-upload.js`. Remove their `Access-Control-Allow-Origin: *` headers; they're same-origin only. |
| 2.5 | Server-to-server calls to the API. `google-drive-upload.js` forwards the user's `ca_access` as `Authorization: Bearer` (it already forwards `auth_token`). `google-oauth-callback.js` **stops minting its own JWT with `AUTH_SECRET`**. It calls `requireAdmin(event)` (Google's redirect back is a top-level GET, so the Lax cookie is sent) and forwards that token. This also closes a gap: today the callback doesn't check who is calling. If the token expired during the consent screen, redirect through `/login?redirect_uri=/admin/job-agent` and ask the user to retry the connect. |
| 2.6 | Delete `netlify/functions/auth-login.js`, `auth-logout.js`, `auth-verify.js`, `scripts/generate-auth-secrets.js` and the `generate-secrets` npm script. Drop `bcryptjs`, `jsonwebtoken` and their `@types`. Remove the commented env-var block in `netlify.toml` that lists `AUTH_SECRET`/`ADMIN_*`. |

## Part 3: portfolio-site frontend

| Step | Change |
|---|---|
| 3.1 | New `src/lib/auth-client.ts` (replaces `src/lib/auth.ts`): `loginUrl(returnTo = location.href)`, `refreshSession()` (`POST ${PUBLIC_AUTH_BASE_URL}/api/session/refresh`, `credentials: "include"`), `logout()` (`POST /logout` with `Accept: application/json` and `credentials: "include"`, then go to `/`), and `fetchMe()` (`auth-me`). |
| 3.2 | `src/lib/graphql-client.ts` `createWriteClient()`: point it at the new host, add `credentials: "include"`, and send no `X-API-Key`/`Authorization` from the browser. Wrap requests: on a 401 (`UNAUTHENTICATED`), call `refreshSession()` and retry once; if the refresh fails, redirect to `loginUrl()`. This handles token expiry during long admin sessions and job-agent runs. Same for any direct `fetch` to admin functions (`ai-assistant`, `google-drive-*`). |
| 3.3 | `src/layouts/AdminLayout.astro`: remove the `<script define:vars>` that injects `__GRAPHQL_WRITE_KEY__` and `__GRAPHQL_AUTH_TOKEN__`. |
| 3.4 | `src/components/admin/AuthProvider.tsx`: drop `login`, and use `fetchMe()` instead of `verifyToken()`. The server already guarantees the user is signed in when the page renders, so on a `401` call `refreshSession()` and, failing that, go to `loginUrl()`. Never redirect to `/admin/login`. Show the user's name and email from `auth-me`. |
| 3.5 | `src/pages/admin/login.astro` becomes a server redirect to `loginUrl('/admin')`, so old bookmarks still work. Delete `src/components/admin/LoginForm`. `AdminNav.tsx`: the button is labeled "Sign out" and calls `logout()`. Note: that signs you out of every app on the domain. |
| 3.6 | Docs: update `.env.example` (remove `AUTH_SECRET`, `ADMIN_*` and `GRAPHQL_WRITE_KEY`; add the auth vars) and rewrite `docs/auth-flow-diagram.md` for the new flow. |

## Tests

- **portfolio-site:** add vitest (the repo has no test runner yet) for `src/lib/server/clang-auth.ts` and `requireAdmin`, with the Lexicon matrix (`web-wtq/lib/__tests__/auth-middleware.test.ts`): valid admin, missing cookie, ignored Bearer header from browsers, expired, wrong issuer, unknown key, `alg: none`, no grant, non-admin role, cross-origin and origin-less writes, Referer fallback.
- **api-career-data:** step 1.6.
- `astro check` and `astro build` must pass.

## Local development

Cookies need a shared parent domain locally too:

- Run clang-auth locally at `http://auth.localtest.me:4000` (see that repo's README). Another local project (the opencode variant) may already be using `:4000`/`:3000`; stop it first. Register the dev app:

  ```sh
  clang-auth app create portfolio --name Portfolio --origin http://portfolio.localtest.me:8080
  clang-auth grant set dev@localtest.me portfolio --role admin
  ```

- Run the site with `netlify dev` and open `http://portfolio.localtest.me:8080`, not `localhost`. `netlify.toml` already pins Astro to `targetPort = 4321`, so the dev proxy can't pick up another server.
- Site `.env`: `AUTH_BASE_URL=http://auth.localtest.me:4000`, `PUBLIC_AUTH_BASE_URL=http://auth.localtest.me:4000`, `AUTH_APP_SLUG=portfolio`, `APP_ORIGIN=http://portfolio.localtest.me:8080`.
- Run the API locally as `http://api.portfolio.localtest.me:<port>` (so it gets the cookie) with `AUTH_BASE_URL=http://auth.localtest.me:4000`, `AUTH_APP_SLUG=portfolio`, `ALLOWED_ADMIN_ORIGINS=http://portfolio.localtest.me:8080`, and point `PUBLIC_GRAPHQL_ENDPOINT` at it.
- For API-only testing: `TOKEN=$(clang-auth token mint dev@localtest.me --ttl 1h)`, then `curl … -H "Authorization: Bearer $TOKEN"`.

Production clang-auth refuses `http://` origins, so local dev always uses the local auth service.

## Rollout

1. **Prepare.** Do prerequisites 1–4. Nothing changes for users yet.
2. **API.** Merge and deploy Part 1 (dual mode), then stand up the custom domain (1b). Check:
   - The current production site still works unchanged, using the old URL and the legacy write key + JWT.
   - The new host answers queries (1.10).
   - A cookie-authenticated mutation through the new host succeeds.
3. **Site.** Switch `PUBLIC_GRAPHQL_ENDPOINT`/`GRAPHQL_ENDPOINT` to the new host and deploy Parts 2 and 3. Verify the checklist below.
4. **Clean up** (after a week or so, once the API logs show no legacy-path requests):
   - Remove `AUTH_SECRET`, `ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH` and `GRAPHQL_WRITE_KEY` from Netlify.
   - Remove `AUTH_SECRET` and `API_WRITE_KEY` from the Lambda (merge as in prerequisite 3).
   - Delete the legacy path and `jsonwebtoken` from the API.
   - Drop CORS origins that can no longer do admin (`clintonlangosch-admin.netlify.app`, deploy previews) unless they still need reads.

**Rollback:**
- Before step 4, redeploy the previous production deploy in Netlify (one click). That build uses the old function URL with the legacy write key + JWT, which the dual-mode API still accepts.
- If the API itself misbehaves, redeploy the previous Lambda zip. The custom domain can stay; nothing depends on it until step 3.

## Verification checklist

- [ ] Signed out: `https://clintonlangosch.com/admin` → `302` to `https://auth.clintonlangosch.com/login?redirect_uri=…`. After sign-in you land on the page you asked for.
- [ ] `/admin/login` (old bookmark) ends up at clang-auth sign-in.
- [ ] Signed in as a user without the `portfolio` grant: 403 page, no redirect loop.
- [ ] Create, edit and delete in Profile, Experiences, Skills, Projects and Education succeed (mutations through `api.portfolio.clintonlangosch.com`).
- [ ] Leave an admin tab open for more than 15 minutes, then save: it succeeds with no sign-in prompt (the refresh-and-retry path). Run a job-agent session longer than 15 minutes.
- [ ] AI assistant works. Google Drive status, connect (OAuth round-trip) and upload work.
- [ ] Page source of an admin page contains no write key and no JWT. Devtools shows `ca_access` with domain `.clintonlangosch.com`, `HttpOnly`, `Secure`, and no `auth_token`.
- [ ] Admin responses carry `Cache-Control: no-store`.
- [ ] A cross-origin POST to `ai-assistant`, or a cookie mutation to the API with `Origin: https://lexicon.clintonlangosch.com`, gets `403`.
- [ ] A read-key request whose query has a comment before `mutation` gets `403`.
- [ ] Public pages make no requests to `auth.clintonlangosch.com`.
- [ ] Sign out: you're signed out of the portfolio admin *and* Lexicon.

## Known limitations

- **Deploy previews** (`*--clintonlangosch.netlify.app`) can show public pages but can't use admin, because they never receive the cookie.
- **Signing out is global.** It ends the clang-auth session for every app.
- **Access changes take up to 15 minutes.** Revoking a grant or disabling a user takes effect within the token lifetime, not instantly.
- **The old function URL stays publicly reachable.** After step 4 it accepts only the read key and clang-auth tokens. A follow-up could restrict it to CloudFront (function URL `AWS_IAM` auth with CloudFront origin access control).
