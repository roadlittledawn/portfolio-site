/**
 * Logout Netlify Function
 */
export const handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  // Clear the auth cookie (Secure only in production)
  const isProduction = process.env.CONTEXT === 'production' || process.env.NODE_ENV === 'production';
  const cookieHeader = `auth_token=; HttpOnly; ${isProduction ? 'Secure; ' : ''}SameSite=Lax; Path=/; Max-Age=0`;

  return {
    statusCode: 200,
    headers: {
      ...headers,
      'Set-Cookie': cookieHeader,
    },
    body: JSON.stringify({
      message: 'Logged out successfully',
    }),
  };
};
