/**
 * Job Agent GraphQL Mutations (AI Generation)
 */

import { gql } from 'graphql-request';
import { AI_USAGE_FIELDS } from './fragments';

// ============================================================================
// RESUME MUTATIONS
// ============================================================================

export const GENERATE_RESUME_MUTATION = gql`
  ${AI_USAGE_FIELDS}
  mutation GenerateResume($jobInfo: JobInfoInput!, $additionalContext: String) {
    generateResume(jobInfo: $jobInfo, additionalContext: $additionalContext) {
      content
      usage {
        ...AIUsageFields
      }
    }
  }
`;

export const REVISE_RESUME_MUTATION = gql`
  ${AI_USAGE_FIELDS}
  mutation ReviseResume($jobInfo: JobInfoInput!, $feedback: String!) {
    reviseResume(jobInfo: $jobInfo, feedback: $feedback) {
      content
      usage {
        ...AIUsageFields
      }
    }
  }
`;

// ============================================================================
// COVER LETTER MUTATIONS
// ============================================================================

export const GENERATE_COVER_LETTER_MUTATION = gql`
  ${AI_USAGE_FIELDS}
  mutation GenerateCoverLetter($jobInfo: JobInfoInput!, $additionalContext: String) {
    generateCoverLetter(jobInfo: $jobInfo, additionalContext: $additionalContext) {
      content
      usage {
        ...AIUsageFields
      }
    }
  }
`;

export const REVISE_COVER_LETTER_MUTATION = gql`
  ${AI_USAGE_FIELDS}
  mutation ReviseCoverLetter($jobInfo: JobInfoInput!, $feedback: String!) {
    reviseCoverLetter(jobInfo: $jobInfo, feedback: $feedback) {
      content
      usage {
        ...AIUsageFields
      }
    }
  }
`;

// ============================================================================
// ANSWER GENERATION MUTATIONS
// ============================================================================

export const GENERATE_ANSWER_MUTATION = gql`
  ${AI_USAGE_FIELDS}
  mutation GenerateAnswer($jobInfo: JobInfoInput!, $question: String!, $currentAnswer: String) {
    generateAnswer(jobInfo: $jobInfo, question: $question, currentAnswer: $currentAnswer) {
      content
      usage {
        ...AIUsageFields
      }
    }
  }
`;

export const REVISE_ANSWER_MUTATION = gql`
  ${AI_USAGE_FIELDS}
  mutation ReviseAnswer($jobInfo: JobInfoInput!, $question: String!, $currentAnswer: String!, $feedback: String!) {
    reviseAnswer(jobInfo: $jobInfo, question: $question, currentAnswer: $currentAnswer, feedback: $feedback) {
      content
      usage {
        ...AIUsageFields
      }
    }
  }
`;
