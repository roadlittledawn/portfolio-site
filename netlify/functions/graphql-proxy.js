import jwt from 'jsonwebtoken';

/**
 * GraphQL Proxy Netlify Function
 * Proxies GraphQL requests and adds Authorization header from HTTP-only cookie
 */
export const handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
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
    // Get GraphQL endpoint from environment
    const graphqlEndpoint = process.env.GRAPHQL_ENDPOINT || process.env.PUBLIC_GRAPHQL_ENDPOINT;
    if (!graphqlEndpoint) {
      console.error('GraphQL endpoint not configured');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'GraphQL endpoint not configured' }),
      };
    }

    // Extract auth token from cookie
    let authToken;
    if (event.headers.cookie) {
      const cookies = event.headers.cookie.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        acc[key] = value;
        return acc;
      }, {});
      authToken = cookies.auth_token;
    }

    // Build headers for GraphQL request
    const graphqlHeaders = {
      'Content-Type': 'application/json',
    };

    // Add API key if available
    const apiKey = process.env.GRAPHQL_API_KEY || process.env.PUBLIC_API_KEY;
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
        console.warn('Invalid auth token, proceeding without Authorization header');
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
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      }),
    };
  }
};
