import { createRemoteJWKSet, jwtVerify, type JWTVerifyGetKey } from "jose";

/**
 * Server-side verification of clang-auth access tokens (the `ca_access`
 * cookie, Domain=.clintonlangosch.com, HttpOnly, 15 min).
 *
 * clang-auth signs a short-lived ES256 JWT and publishes its public keys at
 * `${AUTH_BASE_URL}/.well-known/jwks.json`. We verify locally: no call to the
 * auth service per request.
 *
 * Used by both the Astro middleware (src/middleware.ts) and the Netlify
 * functions (netlify/functions/*), which esbuild bundles from this TS file.
 * Port of web-wtq/lib/clang-auth.ts + auth-middleware.ts.
 */

export const ACCESS_COOKIE = "ca_access";

/** Role required for every admin page and function. */
export const ADMIN_ROLE = "admin";

export interface AccessClaims {
  sub: string;
  email: string;
  name: string | null;
  /** app slug -> roles, e.g. { portfolio: ["admin"] } */
  apps: Record<string, string[]>;
}

export interface AuthUser {
  sub: string;
  email: string;
  name: string | null;
  roles: string[];
}

export interface AuthSettings {
  authBaseUrl: string;
  appSlug: string;
  /** This app's own origin, for redirects and the CSRF check. */
  appOrigin: string;
}

function env(name: string): string | undefined {
  // Netlify functions and the SSR runtime read process.env. `astro dev`
  // without `netlify dev` only populates import.meta.env.
  return (
    (typeof process !== "undefined" ? process.env[name] : undefined) ||
    ((import.meta as { env?: Record<string, string | undefined> }).env?.[name] ?? undefined)
  );
}

export function authSettings(): AuthSettings {
  const authBaseUrl = env("AUTH_BASE_URL");
  const appSlug = env("AUTH_APP_SLUG");
  const appOrigin = env("APP_ORIGIN");
  if (!authBaseUrl || !appSlug || !appOrigin) {
    throw new Error("AUTH_BASE_URL, AUTH_APP_SLUG and APP_ORIGIN must be set");
  }
  return {
    authBaseUrl: authBaseUrl.replace(/\/$/, ""),
    appSlug,
    appOrigin: appOrigin.replace(/\/$/, ""),
  };
}

/** clang-auth's sign-in page, returning to `returnTo` (absolute URL) afterwards. */
export function loginUrl(authBaseUrl: string, returnTo: string): string {
  return `${authBaseUrl}/login?redirect_uri=${encodeURIComponent(returnTo)}`;
}

// One JWKS fetcher per function instance. jose caches the keys and
// re-fetches when it sees an unknown `kid` (after a key rotation).
let jwks: JWTVerifyGetKey | undefined;
let jwksFor: string | undefined;
let testKeys: JWTVerifyGetKey | undefined;

function keySet(authBaseUrl: string): JWTVerifyGetKey {
  if (testKeys) return testKeys;
  if (!jwks || jwksFor !== authBaseUrl) {
    jwks = createRemoteJWKSet(new URL(`${authBaseUrl}/.well-known/jwks.json`));
    jwksFor = authBaseUrl;
  }
  return jwks;
}

/** Tests only: verify against a local key set instead of fetching the JWKS. */
export function setJwksForTesting(keys: JWTVerifyGetKey | undefined): void {
  testKeys = keys;
}

/**
 * Verify signature (ES256 only, key chosen by `kid`), `iss` and `exp`.
 * Throws on any failure.
 */
export async function verifyAccessToken(
  token: string,
  authBaseUrl: string
): Promise<AccessClaims> {
  const { payload } = await jwtVerify(token, keySet(authBaseUrl), {
    issuer: authBaseUrl,
    algorithms: ["ES256"],
    clockTolerance: 30,
  });
  if (
    typeof payload.sub !== "string" ||
    typeof payload.apps !== "object" ||
    payload.apps === null
  ) {
    throw new Error("token is missing required claims");
  }
  return payload as unknown as AccessClaims;
}

/** Read one cookie from a raw `Cookie` header. */
export function readCookie(
  header: string | undefined,
  name: string
): string | undefined {
  if (!header) return undefined;
  for (const part of header.split(";")) {
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    if (part.slice(0, eq).trim() === name) {
      try {
        return decodeURIComponent(part.slice(eq + 1).trim());
      } catch {
        return undefined;
      }
    }
  }
  return undefined;
}

/** Origin of a URL string, or undefined if it doesn't parse. */
export function originOf(value: string | undefined): string | undefined {
  if (!value) return undefined;
  try {
    return new URL(value).origin;
  } catch {
    return undefined;
  }
}

export type AuthResult =
  | { ok: true; user: AuthUser; token: string }
  | { ok: false; status: 401 | 403; code: string; message: string; email?: string };

/**
 * Check a `ca_access` token: valid signature/issuer/expiry, and the admin
 * role on this app. Signed out or invalid → 401; signed in without the
 * admin role → 403.
 */
export async function authenticateToken(
  token: string | undefined,
  settings: AuthSettings = authSettings()
): Promise<AuthResult> {
  if (!token) {
    return { ok: false, status: 401, code: "UNAUTHENTICATED", message: "Sign-in required" };
  }
  let claims: AccessClaims;
  try {
    claims = await verifyAccessToken(token, settings.authBaseUrl);
  } catch {
    // Expired, forged, or signed by an unknown key: treat as signed out.
    return { ok: false, status: 401, code: "UNAUTHENTICATED", message: "Sign-in required" };
  }
  const roles = claims.apps[settings.appSlug];
  if (!Array.isArray(roles) || !roles.includes(ADMIN_ROLE)) {
    return { ok: false, status: 403, code: "FORBIDDEN", message: "Admin access required", email: claims.email };
  }
  return {
    ok: true,
    token,
    user: { sub: claims.sub, email: claims.email, name: claims.name ?? null, roles },
  };
}

// ---------------------------------------------------------------------------
// Netlify functions
// ---------------------------------------------------------------------------

/** The subset of a Netlify HandlerEvent that requireAdmin reads. */
export interface FunctionEvent {
  httpMethod: string;
  headers: Record<string, string | undefined>;
}

export interface FunctionResponse {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
}

const STATE_CHANGING = new Set(["POST", "PUT", "PATCH", "DELETE"]);

function eventHeader(event: FunctionEvent, name: string): string | undefined {
  return event.headers[name] ?? event.headers[name.toLowerCase()] ?? undefined;
}

function errorResponse(statusCode: number, code: string, message: string): FunctionResponse {
  return {
    statusCode,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    body: JSON.stringify({ error: message, code }),
  };
}

export type RequireAdminResult =
  | { ok: true; user: AuthUser; token: string; settings: AuthSettings }
  | { ok: false; status: number; response: FunctionResponse; settings?: AuthSettings };

/**
 * Gate a Netlify function: the caller must have a valid `ca_access` cookie
 * with the admin role on this app. Only the cookie counts; an Authorization
 * header from a browser is ignored.
 *
 * State-changing requests must also come from this app's own origin
 * (Origin, or Referer when Origin is absent). SameSite=Lax treats every
 * *.clintonlangosch.com app as same-site, so without this a sibling app could
 * submit a forged request carrying the user's cookie.
 *
 * On success, `token` is the raw access token, for forwarding to the API as
 * `Authorization: Bearer`.
 */
export async function requireAdmin(event: FunctionEvent): Promise<RequireAdminResult> {
  let settings: AuthSettings;
  try {
    settings = authSettings();
  } catch (error) {
    console.error("Auth configuration error:", error);
    return { ok: false, status: 500, response: errorResponse(500, "INTERNAL_SERVER_ERROR", "Server configuration error") };
  }

  if (STATE_CHANGING.has(event.httpMethod.toUpperCase())) {
    const origin = eventHeader(event, "origin") ?? originOf(eventHeader(event, "referer"));
    if (origin !== settings.appOrigin) {
      return { ok: false, status: 403, response: errorResponse(403, "FORBIDDEN", "Cross-origin request rejected"), settings };
    }
  }

  const token = readCookie(eventHeader(event, "cookie"), ACCESS_COOKIE);
  const result = await authenticateToken(token, settings);
  if (!result.ok) {
    return { ok: false, status: result.status, response: errorResponse(result.status, result.code, result.message), settings };
  }
  return { ok: true, user: result.user, token: result.token, settings };
}
