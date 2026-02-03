/**
 * Education GraphQL Queries & Mutations
 */

import { gql } from 'graphql-request';
import { EDUCATION_CORE_FIELDS } from './fragments';

// ============================================================================
// QUERIES
// ============================================================================

export const EDUCATIONS_QUERY = gql`
  query GetEducations {
    educations {
      id
      institution
      degree
      field
      graduationYear
      relevantCoursework
    }
  }
`;

export const EDUCATION_QUERY = gql`
  query GetEducation($id: ID!) {
    education(id: $id) {
      id
      institution
      degree
      field
      graduationYear
      relevantCoursework
      createdAt
      updatedAt
    }
  }
`;

// ============================================================================
// MUTATIONS
// ============================================================================

export const CREATE_EDUCATION_MUTATION = gql`
  mutation CreateEducation($input: EducationInput!) {
    createEducation(input: $input) {
      id
      institution
      degree
      relevantCoursework
    }
  }
`;

export const UPDATE_EDUCATION_MUTATION = gql`
  ${EDUCATION_CORE_FIELDS}
  mutation UpdateEducation($id: ID!, $input: EducationInput!) {
    updateEducation(id: $id, input: $input) {
      ...EducationCoreFields
    }
  }
`;

export const DELETE_EDUCATION_MUTATION = gql`
  mutation DeleteEducation($id: ID!) {
    deleteEducation(id: $id) {
      success
      id
    }
  }
`;
