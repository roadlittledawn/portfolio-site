/**
 * GraphQL Client Configuration
 * Connects to the career data GraphQL API
 */

import { GraphQLClient } from 'graphql-request';

/**
 * Create a GraphQL client for runtime use (admin UI)
 * This uses the Netlify function proxy which adds Authorization header from HTTP-only cookie
 */
export function createGraphQLClient(): GraphQLClient {
  // Use the GraphQL proxy function for client-side requests
  // This allows the server to extract the auth token from HTTP-only cookie
  // and add it to the Authorization header for the GraphQL API
  const proxyEndpoint = '/.netlify/functions/graphql-proxy';

  return new GraphQLClient(proxyEndpoint, {
    credentials: 'include', // Include cookies so proxy can extract auth token
  });
}

/**
 * Create a GraphQL client with server-side credentials
 * For use in Astro page generation and Netlify functions
 */
export function createServerGraphQLClient(endpoint?: string, apiKey?: string): GraphQLClient {
  const url = endpoint || process.env.GRAPHQL_ENDPOINT;
  const key = apiKey || process.env.GRAPHQL_API_KEY || '';

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
 * Get a GraphQL client for admin UI requests
 * Creates a fresh client each time to ensure current auth token is used
 */
export function getGraphQLClient(): GraphQLClient {
  return createGraphQLClient();
}

export default getGraphQLClient;
