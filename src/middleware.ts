import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, cookies, redirect } = context;
  
  // Check if this is an admin page (but not login)
  if (url.pathname.startsWith('/admin') && url.pathname !== '/admin/login') {
    const token = cookies.get('auth_token')?.value;
    
    if (!token) {
      return redirect('/admin/login', 302);
    }

    // Verify token
    try {
      const response = await fetch(`${url.origin}/.netlify/functions/auth-verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });

      const result = await response.json();
      
      if (!response.ok || !result.valid) {
        return redirect('/admin/login', 302);
      }
    } catch (error) {
      return redirect('/admin/login', 302);
    }
  }

  return next();
});
