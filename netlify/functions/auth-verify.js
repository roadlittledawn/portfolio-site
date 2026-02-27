import jwt from 'jsonwebtoken';

/**
 * Token Verification Netlify Function
 */
export const handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Credentials': 'true',
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

  // Get token from cookie or body
  let token;
  
  // Check body first (for server-side calls)
  if (event.body) {
    try {
      const body = JSON.parse(event.body);
      token = body.token;
    } catch (e) {
      // Not JSON, ignore
    }
  }
  
  // If no token in body, check cookies
  if (!token && event.headers.cookie) {
    const cookies = event.headers.cookie.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {});
    token = cookies.auth_token;
  }

  if (!token) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ valid: false, error: 'No token provided' }),
    };
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.AUTH_SECRET);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        valid: true,
        user: {
          username: decoded.username,
        },
      }),
    };
  } catch (error) {
    // Token is invalid or expired
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({
        valid: false,
        error: 'Invalid or expired token',
      }),
    };
  }
};
