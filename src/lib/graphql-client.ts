/**
 * GraphQL Client Configuration
 * Connects to the career data GraphQL API
 */

import { GraphQLClient } from 'graphql-request';

// For client-side (admin UI)
const GRAPHQL_ENDPOINT = import.meta.env.PUBLIC_GRAPHQL_ENDPOINT;
const API_KEY = import.meta.env.PUBLIC_API_KEY || '';

/**
 * Create a GraphQL client for runtime use (admin UI)
 * This uses PUBLIC_ prefixed env vars that are available client-side
 */
export function createGraphQLClient(): GraphQLClient {
  if (!GRAPHQL_ENDPOINT) {
    throw new Error('PUBLIC_GRAPHQL_ENDPOINT environment variable is required');
  }

  return new GraphQLClient(GRAPHQL_ENDPOINT, {
    headers: {
      'X-API-Key': API_KEY,
    },
    credentials: 'include', // Include cookies for auth
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
