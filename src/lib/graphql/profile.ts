/**
 * Profile GraphQL Queries & Mutations
 */

import { gql } from 'graphql-request';
import { PERSONAL_INFO_FIELDS, POSITIONING_FIELDS, PROFILE_LINKS_FIELDS } from './fragments';

// ============================================================================
// QUERIES
// ============================================================================

export const PROFILE_QUERY = gql`
  ${PROFILE_LINKS_FIELDS}
  query GetProfile {
    profile {
      id
      personalInfo {
        name
        email
        phone
        location
        links {
          ...ProfileLinksFields
        }
      }
      positioning {
        current
        byRole {
          technical_writer
          technical_writing_manager
          software_engineer
          engineering_manager
        }
      }
      valuePropositions
      professionalMission
      uniqueSellingPoints
      updatedAt
    }
  }
`;

// ============================================================================
// MUTATIONS
// ============================================================================

export const UPDATE_PROFILE_MUTATION = gql`
  ${PROFILE_LINKS_FIELDS}
  mutation UpdateProfile($input: ProfileInput!) {
    updateProfile(input: $input) {
      id
      personalInfo {
        name
        email
        phone
        location
        links {
          ...ProfileLinksFields
        }
      }
      positioning {
        current
        byRole {
          technical_writer
          technical_writing_manager
          software_engineer
          engineering_manager
        }
      }
      valuePropositions
      professionalMission
      uniqueSellingPoints
      updatedAt
    }
  }
`;
