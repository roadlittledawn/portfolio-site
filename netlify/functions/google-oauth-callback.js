import { google } from 'googleapis';
import { GraphQLClient } from 'graphql-request';
import jwt from 'jsonwebtoken';

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

    console.log('Exchanging code for tokens...');
    const { tokens } = await oauth2Client.getToken(code);
    console.log('Tokens received:', { 
      hasAccessToken: !!tokens.access_token,
      hasRefreshToken: !!tokens.refresh_token,
      scope: tokens.scope 
    });
    
    // Set credentials BEFORE making API calls
    oauth2Client.setCredentials(tokens);

    // Get user email
    console.log('Getting user info...');
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { data } = await oauth2.userinfo.get();
    console.log('User email:', data.email);

    // Generate a valid JWT for server-to-server auth
    const token = jwt.sign(
      { username: 'admin', iat: Math.floor(Date.now() / 1000) },
      process.env.AUTH_SECRET,
      { expiresIn: '1h' }
    );

    // Store tokens in MongoDB via GraphQL API
    const client = new GraphQLClient(process.env.GRAPHQL_ENDPOINT || process.env.PUBLIC_GRAPHQL_ENDPOINT, {
      headers: {
        'X-API-Key': process.env.GRAPHQL_WRITE_KEY,
        'Authorization': `Bearer ${token}`,
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
