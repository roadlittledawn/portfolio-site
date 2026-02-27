/**
 * Project GraphQL Queries & Mutations
 */

import { gql } from 'graphql-request';
import { PROJECT_LINK_FIELDS, PROJECT_CORE_FIELDS } from './fragments';

// ============================================================================
// QUERIES
// ============================================================================

export const PROJECTS_QUERY = gql`
  ${PROJECT_LINK_FIELDS}
  query GetProjects {
    projects {
      id
      name
      type
      date
      featured
      overview
      challenge
      approach
      outcome
      impact
      technologies
      keywords
      roleTypes
      links {
        ...ProjectLinkFields
      }
      createdAt
      updatedAt
    }
  }
`;

export const PROJECT_QUERY = gql`
  ${PROJECT_LINK_FIELDS}
  query GetProject($id: ID!) {
    project(id: $id) {
      id
      name
      type
      date
      featured
      overview
      challenge
      approach
      outcome
      impact
      technologies
      keywords
      roleTypes
      links {
        ...ProjectLinkFields
      }
      createdAt
      updatedAt
    }
  }
`;

// ============================================================================
// MUTATIONS
// ============================================================================

export const CREATE_PROJECT_MUTATION = gql`
  mutation CreateProject($input: ProjectInput!) {
    createProject(input: $input) {
      id
      name
    }
  }
`;

export const UPDATE_PROJECT_MUTATION = gql`
  ${PROJECT_LINK_FIELDS}
  ${PROJECT_CORE_FIELDS}
  mutation UpdateProject($id: ID!, $input: ProjectInput!) {
    updateProject(id: $id, input: $input) {
      ...ProjectCoreFields
      links {
        ...ProjectLinkFields
      }
    }
  }
`;

export const DELETE_PROJECT_MUTATION = gql`
  mutation DeleteProject($id: ID!) {
    deleteProject(id: $id) {
      success
      id
    }
  }
`;
