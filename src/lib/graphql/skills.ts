/**
 * Skill GraphQL Queries & Mutations
 */

import { gql } from 'graphql-request';
import { SKILL_CORE_FIELDS } from './fragments';

// ============================================================================
// QUERIES
// ============================================================================

export const SKILLS_QUERY = gql`
  query GetSkills {
    skills {
      id
      name
      roleRelevance
      level
      rating
      yearsOfExperience
      tags
      keywords
      iconName
      featured
      createdAt
      updatedAt
    }
  }
`;

export const SKILL_QUERY = gql`
  query GetSkill($id: ID!) {
    skill(id: $id) {
      id
      name
      roleRelevance
      level
      rating
      yearsOfExperience
      tags
      keywords
      iconName
      featured
      createdAt
      updatedAt
    }
  }
`;

// ============================================================================
// MUTATIONS
// ============================================================================

export const CREATE_SKILL_MUTATION = gql`
  mutation CreateSkill($input: SkillInput!) {
    createSkill(input: $input) {
      id
      name
    }
  }
`;

export const UPDATE_SKILL_MUTATION = gql`
  ${SKILL_CORE_FIELDS}
  mutation UpdateSkill($id: ID!, $input: SkillInput!) {
    updateSkill(id: $id, input: $input) {
      ...SkillCoreFields
    }
  }
`;

export const DELETE_SKILL_MUTATION = gql`
  mutation DeleteSkill($id: ID!) {
    deleteSkill(id: $id) {
      success
      id
    }
  }
`;
