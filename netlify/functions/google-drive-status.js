import jwt from 'jsonwebtoken';
import { GraphQLClient } from 'graphql-request';

export const handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  // Verify auth token
  const cookies = event.headers.cookie?.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    acc[key] = value;
    return acc;
  }, {});

  const token = cookies?.auth_token;
  if (!token) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ error: 'Unauthorized' }),
    };
  }

  try {
    jwt.verify(token, process.env.AUTH_SECRET);
  } catch (error) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ error: 'Invalid token' }),
    };
  }

  // Query OAuth token from API
  const client = new GraphQLClient(process.env.GRAPHQL_ENDPOINT, {
    headers: {
      'X-API-Key': process.env.GRAPHQL_READ_KEY,
    },
  });

  const query = `
    query GetOAuthToken($service: String!, $userId: String!) {
      getOAuthToken(service: $service, userId: $userId) {
        email
        scopes
      }
    }
  `;

  try {
    const data = await client.request(query, {
      service: 'google_drive',
      userId: 'admin',
    });

    if (data.getOAuthToken) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          connected: true,
          email: data.getOAuthToken.email,
        }),
      };
    } else {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ connected: false }),
      };
    }
  } catch (error) {
    console.error('Error checking OAuth status:', error);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ connected: false }),
    };
  }
};
