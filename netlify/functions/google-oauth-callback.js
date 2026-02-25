import { google } from 'googleapis';
import { GraphQLClient } from 'graphql-request';

export const handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: 'Method not allowed',
    };
  }

  const code = event.queryStringParameters?.code;
  if (!code) {
    return {
      statusCode: 400,
      body: 'Missing authorization code',
    };
  }

  try {
    // Exchange code for tokens
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_OAUTH_CLIENT_ID,
      process.env.GOOGLE_OAUTH_CLIENT_SECRET,
      process.env.GOOGLE_OAUTH_REDIRECT_URI
    );

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Get user email
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { data } = await oauth2.userinfo.get();

    // Store tokens in MongoDB via GraphQL API
    const client = new GraphQLClient(process.env.GRAPHQL_ENDPOINT, {
      headers: {
        'X-API-Key': process.env.GRAPHQL_WRITE_KEY,
        'Authorization': `Bearer ${process.env.AUTH_SECRET}`,
      },
    });

    const mutation = `
      mutation StoreOAuthToken($token: OAuthTokenInput!) {
        storeOAuthToken(token: $token) {
          service
          userId
          email
        }
      }
    `;

    await client.request(mutation, {
      token: {
        service: 'google_drive',
        userId: 'admin',
        refreshToken: tokens.refresh_token,
        accessToken: tokens.access_token,
        accessTokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : null,
        scopes: tokens.scope?.split(' ') || [],
        email: data.email,
      },
    });

    // Redirect back to job agent page
    return {
      statusCode: 302,
      headers: {
        Location: '/admin/job-agent?oauth=success',
      },
      body: '',
    };
  } catch (error) {
    console.error('OAuth callback error:', error);
    return {
      statusCode: 302,
      headers: {
        Location: '/admin/job-agent?oauth=error',
      },
      body: '',
    };
  }
};
