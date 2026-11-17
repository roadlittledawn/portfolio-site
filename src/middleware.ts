import { defineMiddleware } from 'astro:middleware';
import {
  ACCESS_COOKIE,
  authSettings,
  authenticateToken,
  loginUrl,
  type AuthSettings,
} from './lib/server/clang-auth';

const NO_STORE = 'no-store';

function isAdminPath(pathname: string): boolean {
  return pathname === '/admin' || pathname.startsWith('/admin/');
}

function forbiddenPage(email: string | undefined, authBaseUrl: string): Response {
  const escape = (s: string) =>
    s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
  const who = email ? ` as <strong>${escape(email)}</strong>` : '';
  const html = `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>No access | Career Admin</title></head>
<body style="font-family: system-ui, sans-serif; max-width: 32rem; margin: 4rem auto; padding: 0 1rem; line-height: 1.5;">
  <h1>No access</h1>
  <p>You're signed in${who}, but this account doesn't have admin access to the portfolio.</p>
  <p><a href="${escape(authBaseUrl)}/">Manage your account</a> · <a href="/">Back to the site</a></p>
</body>
</html>`;
  return new Response(html, {
    status: 403,
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': NO_STORE },
  });
}

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, cookies, redirect, locals } = context;

  if (!isAdminPath(url.pathname)) {
    return next();
  }

  let settings: AuthSettings;
  try {
    settings = authSettings();
  } catch (error) {
    console.error('Auth configuration error:', error);
    return new Response('Server configuration error', {
      status: 500,
      headers: { 'Cache-Control': NO_STORE },
    });
  }

  const result = await authenticateToken(cookies.get(ACCESS_COOKIE)?.value, settings);

  if (!result.ok && result.status === 401) {
    // Old /admin/login bookmarks land on the dashboard after sign-in.
    const path = url.pathname.replace(/\/$/, '') === '/admin/login' ? '/admin' : `${url.pathname}${url.search}`;
    const response = redirect(loginUrl(settings.authBaseUrl, `${settings.appOrigin}${path}`), 302);
    response.headers.set('Cache-Control', NO_STORE);
    return response;
  }

  if (!result.ok) {
    // Signed in without the grant. Redirecting to sign-in would loop.
    return forbiddenPage(result.email, settings.authBaseUrl);
  }

  locals.user = result.user;
  const response = await next();
  response.headers.set('Cache-Control', NO_STORE);
  return response;
});
