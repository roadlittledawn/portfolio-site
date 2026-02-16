/**
 * GraphQL Client Configuration
 * Connects directly to the career data GraphQL API using API key-based authentication
 *
 * Security Model:
 * - Read-only key (PUBLIC_GRAPHQL_READ_KEY): Public, embedded in client JS, only allows queries
 * - Write key (GRAPHQL_WRITE_KEY): Injected server-side by AdminLayout.astro into
 *   window.__GRAPHQL_WRITE_KEY__. Never bundled into static JS by Vite.
 * - Auth token (auth_token cookie): Injected server-side by AdminLayout.astro into
 *   window.__GRAPHQL_AUTH_TOKEN__. Sent as Authorization: Bearer header for mutations,
 *   providing a second authentication factor alongside the write key.
 */

import { GraphQLClient } from 'graphql-request';

/**
 * Get the GraphQL endpoint URL
 * Uses PUBLIC_GRAPHQL_ENDPOINT for client-side code (available in browser)
 * Falls back to GRAPHQL_ENDPOINT for server-side code
 */
function getGraphQLEndpoint(): string {
  // Check browser-accessible env var first
  if (typeof import.meta !== 'undefined' && import.meta.env?.PUBLIC_GRAPHQL_ENDPOINT) {
    return import.meta.env.PUBLIC_GRAPHQL_ENDPOINT;
  }
  
  // Fall back to server-side env var
  if (typeof process !== 'undefined' && process.env?.GRAPHQL_ENDPOINT) {
    return process.env.GRAPHQL_ENDPOINT;
  }
  
  throw new Error('GraphQL endpoint not configured. Set PUBLIC_GRAPHQL_ENDPOINT or GRAPHQL_ENDPOINT environment variable.');
}

/**
 * Create a GraphQL client for read-only operations (public pages)
 * Uses a read-only API key that's safe to expose to the browser
 * This key only allows queries, not mutations
 */
export function createReadOnlyClient(): GraphQLClient {
  const endpoint = getGraphQLEndpoint();
  const apiKey = import.meta.env?.PUBLIC_GRAPHQL_READ_KEY || '';

  if (!apiKey) {
    throw new Error('PUBLIC_GRAPHQL_READ_KEY not set. Public queries will fail.');
  }

  return new GraphQLClient(endpoint, {
    headers: {
      'X-API-Key': apiKey,
    },
  });
}

/**
 * Create a GraphQL client for admin operations (mutations and queries)
 * Uses a write API key injected at SSR time via AdminLayout.astro
 *
 * Security: The write key and auth token are injected server-side into admin page
 * HTML only after middleware validates the auth cookie. Neither value is bundled
 * into any JS file by Vite, so unauthenticated users cannot extract them from
 * static assets. Mutations require both the write key (X-API-Key) and a valid
 * JWT (Authorization: Bearer) as a second authentication factor.
 */
export function createWriteClient(): GraphQLClient {
  const endpoint = getGraphQLEndpoint();
  const apiKey = (typeof window !== 'undefined' && (window as any).__GRAPHQL_WRITE_KEY__) || '';
  const authToken = (typeof window !== 'undefined' && (window as any).__GRAPHQL_AUTH_TOKEN__) || '';

  if (!apiKey) {
    throw new Error('GRAPHQL_WRITE_KEY not available. Ensure you are on an authenticated admin page.');
  }

  const headers: Record<string, string> = {
    'X-API-Key': apiKey,
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  return new GraphQLClient(endpoint, { headers });
}

/**
 * Create a GraphQL client with server-side credentials
 * For use in Astro page generation and Netlify functions
 * @deprecated Use createReadOnlyClient() for queries or createWriteClient() for mutations
 */
export function createServerGraphQLClient(endpoint?: string, apiKey?: string): GraphQLClient {
  const url = endpoint || process.env.GRAPHQL_ENDPOINT;
  const key = apiKey || process.env.GRAPHQL_WRITE_KEY || process.env.GRAPHQL_API_KEY || '';

  if (!url) {
    throw new Error('GRAPHQL_ENDPOINT environment variable is required');
  }

  return new GraphQLClient(url, {
    headers: {
      'X-API-Key': key,
    },
  });
}

/**
 * Get a GraphQL client for runtime use
 * Returns the appropriate client based on context:
 * - Admin pages: Write client (allows mutations)
 * - Public pages: Read-only client (queries only)
 * 
 * Note: This function uses URL path detection (/admin/*) which aligns with
 * the middleware auth pattern. For explicit control or server-side usage,
 * call createReadOnlyClient() or createWriteClient() directly.
 */
export function getGraphQLClient(): GraphQLClient {
  // Check if we're on an admin page by looking at the URL
  // This matches the middleware pattern where all admin routes start with /admin
  if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) {
    return createWriteClient();
  }
  
  return createReadOnlyClient();
}

export default getGraphQLClient;
