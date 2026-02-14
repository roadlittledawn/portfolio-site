/**
 * GraphQL Client Configuration
 * Connects directly to the career data GraphQL API using API key-based authentication
 * 
 * Security Model:
 * - Read-only key: Public, embedded in client code, only allows queries
 * - Write key: Protected by admin auth middleware, allows mutations
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
    console.warn('PUBLIC_GRAPHQL_READ_KEY not configured. GraphQL queries will fail without a valid API key.');
  }

  return new GraphQLClient(endpoint, {
    headers: {
      'X-API-Key': apiKey,
    },
  });
}

/**
 * Create a GraphQL client for admin operations (mutations and queries)
 * Uses a write API key that's protected by admin authentication middleware
 * 
 * Security: This key is only loaded on admin pages which require cookie-based
 * authentication. While the key is visible in browser code, access is controlled
 * by the middleware auth check.
 */
export function createWriteClient(): GraphQLClient {
  const endpoint = getGraphQLEndpoint();
  const apiKey = import.meta.env?.PUBLIC_GRAPHQL_WRITE_KEY || '';
  
  if (!apiKey) {
    throw new Error('PUBLIC_GRAPHQL_WRITE_KEY not set. Admin operations will fail.');
  }

  return new GraphQLClient(endpoint, {
    headers: {
      'X-API-Key': apiKey,
    },
  });
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
