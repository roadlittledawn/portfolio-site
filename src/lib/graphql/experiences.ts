/**
 * Experience GraphQL Queries & Mutations
 */

import { gql } from 'graphql-request';
import { ACHIEVEMENT_FIELDS, EXPERIENCE_CORE_FIELDS } from './fragments';

// ============================================================================
// QUERIES
// ============================================================================

export const EXPERIENCES_QUERY = gql`
  ${ACHIEVEMENT_FIELDS}
  query GetExperiences {
    experiences {
      id
      company
      location
      title
      industry
      summary
      startDate
      endDate
      roleTypes
      responsibilities
      achievements {
        ...AchievementFields
      }
      technologies
      organizations
      crossFunctional
      displayOrder
      featured
      createdAt
      updatedAt
    }
  }
`;

export const EXPERIENCE_QUERY = gql`
  ${ACHIEVEMENT_FIELDS}
  query GetExperience($id: ID!) {
    experience(id: $id) {
      id
      company
      location
      title
      industry
      summary
      startDate
      endDate
      roleTypes
      responsibilities
      achievements {
        ...AchievementFields
      }
      technologies
      organizations
      crossFunctional
      displayOrder
      featured
      createdAt
      updatedAt
    }
  }
`;

// ============================================================================
// MUTATIONS
// ============================================================================

export const CREATE_EXPERIENCE_MUTATION = gql`
  mutation CreateExperience($input: ExperienceInput!) {
    createExperience(input: $input) {
      id
      company
      title
    }
  }
`;

export const UPDATE_EXPERIENCE_MUTATION = gql`
  ${ACHIEVEMENT_FIELDS}
  ${EXPERIENCE_CORE_FIELDS}
  mutation UpdateExperience($id: ID!, $input: ExperienceInput!) {
    updateExperience(id: $id, input: $input) {
      ...ExperienceCoreFields
      achievements {
        ...AchievementFields
      }
    }
  }
`;

export const DELETE_EXPERIENCE_MUTATION = gql`
  mutation DeleteExperience($id: ID!) {
    deleteExperience(id: $id) {
      success
      id
    }
  }
`;
