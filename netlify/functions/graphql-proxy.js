import jwt from 'jsonwebtoken';

/**
 * GraphQL Proxy Netlify Function
 * Proxies GraphQL requests and adds Authorization header from HTTP-only cookie
 */
export const handler = async (event, context) => {
  // Determine allowed origin
  const requestOrigin = event.headers.origin || event.headers.Origin;
  const allowedOrigins = [
    'http://localhost:8080',
    'http://localhost:4321',
    'https://clintonlangosch.com',
    process.env.URL, // Netlify deploy preview URL
  ].filter(Boolean);
  
  const isAllowedOrigin = allowedOrigins.includes(requestOrigin);
  
  // Reject requests from non-allowed origins in production
  if (!isAllowedOrigin && process.env.CONTEXT === 'production') {
    return {
      statusCode: 403,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ error: 'Forbidden' }),
    };
  }
  
  const allowedOrigin = isAllowedOrigin ? requestOrigin : 'http://localhost:8080';

  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
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

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // Get GraphQL endpoint from environment (server-side only)
    const graphqlEndpoint = process.env.GRAPHQL_ENDPOINT;
    if (!graphqlEndpoint) {
      console.error('GRAPHQL_ENDPOINT environment variable not configured');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Server configuration error' }),
      };
    }

    // Extract auth token from cookie
    let authToken;
    if (event.headers.cookie) {
      const cookies = event.headers.cookie.split(';').reduce((acc, cookie) => {
        const trimmed = cookie.trim();
        const firstEquals = trimmed.indexOf('=');
        if (firstEquals > 0) {
          const key = trimmed.substring(0, firstEquals);
          const value = trimmed.substring(firstEquals + 1);
          acc[key] = value;
        }
        return acc;
      }, {});
      authToken = cookies.auth_token;
    }

    // Build headers for GraphQL request
    const graphqlHeaders = {
      'Content-Type': 'application/json',
    };

    // Add API key if available (server-side only)
    const apiKey = process.env.GRAPHQL_API_KEY;
    if (apiKey) {
      graphqlHeaders['X-API-Key'] = apiKey;
    }

    // Add Authorization header if token exists and is valid
    if (authToken) {
      try {
        // Verify token is valid before adding to request
        jwt.verify(authToken, process.env.AUTH_SECRET);
        graphqlHeaders['Authorization'] = `Bearer ${authToken}`;
      } catch (err) {
        console.warn('Invalid auth token:', err.message);
        // Continue without Authorization header - let GraphQL API handle it
      }
    }

    // Forward the GraphQL request
    const response = await fetch(graphqlEndpoint, {
      method: 'POST',
      headers: graphqlHeaders,
      body: event.body,
    });

    const data = await response.text();

    return {
      statusCode: response.status,
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: data,
    };
  } catch (error) {
    console.error('GraphQL proxy error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal server error',
      }),
    };
  }
};
