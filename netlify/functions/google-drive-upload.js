import { google } from 'googleapis';
import jwt from 'jsonwebtoken';
import { GraphQLClient } from 'graphql-request';
import { Readable } from 'stream';

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function generateFilename(type, jobTitle, companyName) {
  const date = new Date().toISOString().split('T')[0];
  const sluggedTitle = slugify(jobTitle);
  const sluggedCompany = slugify(companyName);
  return `${date}-${type}-${sluggedTitle}-${sluggedCompany}.md`;
}

async function getOAuthCredentials(authToken) {
  const client = new GraphQLClient(process.env.GRAPHQL_ENDPOINT, {
    headers: {
      'X-API-Key': process.env.GRAPHQL_WRITE_KEY,
      'Authorization': `Bearer ${authToken}`,
    },
  });

  const query = `
    query GetOAuthTokenWithCredentials($service: String!, $userId: String!) {
      getOAuthTokenWithCredentials(service: $service, userId: $userId) {
        refreshToken
        accessToken
        accessTokenExpiry
      }
    }
  `;

  const data = await client.request(query, {
    service: 'google_drive',
    userId: 'admin',
  });

  return data.getOAuthTokenWithCredentials;
}

async function uploadFile(oauth2Client, content, filename, folderId) {
  const drive = google.drive({ version: 'v3', auth: oauth2Client });
  
  const fileMetadata = {
    name: filename,
    parents: [folderId],
  };

  const media = {
    mimeType: 'text/markdown',
    body: Readable.from([content]),
  };

  const response = await drive.files.create({
    requestBody: fileMetadata,
    media: media,
    fields: 'id,name,webViewLink',
  });

  return response.data;
}

export const handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
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

  const authToken = cookies?.auth_token;
  if (!authToken) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ error: 'Unauthorized' }),
    };
  }

  try {
    jwt.verify(authToken, process.env.AUTH_SECRET);
  } catch (error) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ error: 'Invalid token' }),
    };
  }

  // Parse request body
  let body;
  try {
    body = JSON.parse(event.body);
  } catch (error) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Invalid JSON' }),
    };
  }

  const { files } = body;
  if (!files || !Array.isArray(files)) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Missing files array' }),
    };
  }

  try {
    // Get OAuth credentials from API
    const credentials = await getOAuthCredentials(authToken);
    if (!credentials) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Google Drive not connected' }),
      };
    }

    // Create OAuth2 client with credentials
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_OAUTH_CLIENT_ID,
      process.env.GOOGLE_OAUTH_CLIENT_SECRET,
      process.env.GOOGLE_OAUTH_REDIRECT_URI
    );

    oauth2Client.setCredentials({
      refresh_token: credentials.refreshToken,
      access_token: credentials.accessToken,
      expiry_date: credentials.accessTokenExpiry ? new Date(credentials.accessTokenExpiry).getTime() : null,
    });

    // Upload files
    const uploads = [];
    const errors = [];

    for (const file of files) {
      try {
        const filename = generateFilename(file.type, file.jobTitle, file.companyName);
        const result = await uploadFile(oauth2Client, file.content, filename, file.folderId);
        
        uploads.push({
          type: file.type,
          fileId: result.id,
          fileName: result.name,
          webViewLink: result.webViewLink,
        });
      } catch (error) {
        errors.push({
          type: file.type,
          message: error.message,
        });
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: errors.length === 0,
        uploads,
        errors: errors.length > 0 ? errors : undefined,
      }),
    };
  } catch (error) {
    console.error('Upload error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Upload failed', message: error.message }),
    };
  }
};
