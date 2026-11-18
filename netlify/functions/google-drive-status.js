import { requireAdmin } from '../../src/lib/server/clang-auth';
import { GraphQLClient } from 'graphql-request';

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

  // Query OAuth token from API
  const client = new GraphQLClient(process.env.GRAPHQL_ENDPOINT || process.env.PUBLIC_GRAPHQL_ENDPOINT, {
    headers: {
      'X-API-Key': process.env.PUBLIC_GRAPHQL_READ_KEY,
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
