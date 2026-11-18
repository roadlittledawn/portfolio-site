/**
 * Browser-side helpers for clang-auth (https://auth.clintonlangosch.com).
 *
 * The access token lives in an HttpOnly cookie (`ca_access`,
 * Domain=.clintonlangosch.com) that page JavaScript can't read. Requests to
 * our Netlify functions and to the GraphQL API send it automatically. When it
 * expires (every 15 minutes) we ask the auth service for a new one using its
 * own session cookie, then retry.
 *
 * Only admin pages use this; public pages never talk to the auth service.
 */

export const AUTH_BASE_URL = (import.meta.env.PUBLIC_AUTH_BASE_URL ?? '').replace(/\/$/, '');

export interface AuthUser {
  email: string;
  name: string | null;
  roles: string[];
}

/** clang-auth's sign-in page, returning to `returnTo` afterwards. */
export function loginUrl(returnTo: string = window.location.href): string {
  const absolute = new URL(returnTo, window.location.origin).href;
  return `${AUTH_BASE_URL}/login?redirect_uri=${encodeURIComponent(absolute)}`;
}

export function redirectToLogin(returnTo?: string): void {
  window.location.assign(loginUrl(returnTo));
}

// Several requests can hit a 401 at once when the token expires; share one
// refresh between them.
let refreshing: Promise<boolean> | null = null;

/** Get a fresh access-token cookie. Resolves false if there's no session. */
export function refreshSession(): Promise<boolean> {
  if (!refreshing) {
    refreshing = fetch(`${AUTH_BASE_URL}/api/session/refresh`, {
      method: 'POST',
      credentials: 'include',
    })
      .then((res) => res.ok)
      .catch(() => false)
      .finally(() => {
        refreshing = null;
      });
  }
  return refreshing;
}

/**
 * fetch() for anything that authenticates with the clang-auth cookie (our
 * admin functions, the GraphQL API). On 401 it refreshes the session and
 * retries once; if there's no session it sends the user to sign in.
 *
 * Request bodies must be replayable (strings, not streams) for the retry.
 */
export async function authFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const res = await fetch(input, init);
  if (res.status !== 401) return res;
  if (await refreshSession()) {
    const retry = await fetch(input, init);
    if (retry.status !== 401) return retry;
  }
  redirectToLogin();
  return res;
}

/** The signed-in admin, or null when signed out (after trying a refresh). */
export async function fetchMe(): Promise<AuthUser | null> {
  const get = () => fetch('/.netlify/functions/auth-me', { credentials: 'same-origin' });
  let res = await get();
  if (res.status === 401 && (await refreshSession())) {
    res = await get();
  }
  if (!res.ok) return null;
  return (await res.json()) as AuthUser;
}

/**
 * End the clang-auth session, then go to the public home page.
 * This signs out of every app on the domain.
 */
export async function logout(): Promise<void> {
  try {
    await fetch(`${AUTH_BASE_URL}/logout`, {
      method: 'POST',
      credentials: 'include',
      headers: { Accept: 'application/json' },
    });
  } catch (error) {
    // The access cookie still expires within 15 minutes.
    console.error('Sign-out request failed:', error);
  }
  window.location.assign('/');
}
