import { google } from 'googleapis';
import { requireAdmin } from '../../src/lib/server/clang-auth';

export const handler = async (event) => {
  // Same-origin only (called from the admin UI), so no CORS headers.
  const headers = { 'Content-Type': 'application/json' };

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  // clang-auth admin cookie (+ same-origin check for POST)
  const auth = await requireAdmin(event);
  if (!auth.ok) return auth.response;

  // Create OAuth2 client
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_OAUTH_CLIENT_ID,
    process.env.GOOGLE_OAUTH_CLIENT_SECRET,
    process.env.GOOGLE_OAUTH_REDIRECT_URI
  );

  // Generate auth URL
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/drive.file',
      'https://www.googleapis.com/auth/userinfo.email',
    ],
    prompt: 'consent',
  });

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ authUrl }),
  };
};
