import { google } from 'googleapis';
import { GraphQLClient } from 'graphql-request';
import { loginUrl, requireAdmin } from '../../src/lib/server/clang-auth';

export const handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: 'Method not allowed',
    };
  }

  // Google's redirect back is a top-level GET, so the SameSite=Lax ca_access
  // cookie is sent. Check it before using the (single-use) code: only the
  // admin may connect a Drive account.
  const auth = await requireAdmin(event);
  if (!auth.ok) {
    if (auth.status === 401 && auth.settings) {
      // Token expired during the consent screen: sign in again, then retry.
      return {
        statusCode: 302,
        headers: {
          Location: loginUrl(auth.settings.authBaseUrl, `${auth.settings.appOrigin}/admin/job-agent?oauth=expired`),
          'Cache-Control': 'no-store',
        },
        body: '',
      };
    }
    return auth.response;
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

    // Store tokens in MongoDB via GraphQL API, forwarding the admin's
    // clang-auth access token (server-to-server: Bearer, no Origin check).
    const client = new GraphQLClient(process.env.GRAPHQL_ENDPOINT || process.env.PUBLIC_GRAPHQL_ENDPOINT, {
      headers: {
        'Authorization': `Bearer ${auth.token}`,
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
