/**
 * GraphQL Queries and Mutations Index
 * Re-exports all queries organized by entity for convenient imports
 */

// Fragments (for advanced usage)
export * from './fragments';

// Experience queries & mutations
export {
  EXPERIENCES_QUERY,
  EXPERIENCE_QUERY,
  CREATE_EXPERIENCE_MUTATION,
  UPDATE_EXPERIENCE_MUTATION,
  DELETE_EXPERIENCE_MUTATION,
} from './experiences';

// Skill queries & mutations
export {
  SKILLS_QUERY,
  SKILL_QUERY,
  CREATE_SKILL_MUTATION,
  UPDATE_SKILL_MUTATION,
  DELETE_SKILL_MUTATION,
} from './skills';

// Project queries & mutations
export {
  PROJECTS_QUERY,
  PROJECT_QUERY,
  CREATE_PROJECT_MUTATION,
  UPDATE_PROJECT_MUTATION,
  DELETE_PROJECT_MUTATION,
} from './projects';

// Education queries & mutations
export {
  EDUCATIONS_QUERY,
  EDUCATION_QUERY,
  CREATE_EDUCATION_MUTATION,
  UPDATE_EDUCATION_MUTATION,
  DELETE_EDUCATION_MUTATION,
} from './education';

// Profile queries & mutations
export {
  PROFILE_QUERY,
  UPDATE_PROFILE_MUTATION,
} from './profile';

// Job agent (AI generation) mutations
export {
  GENERATE_RESUME_MUTATION,
  REVISE_RESUME_MUTATION,
  GENERATE_COVER_LETTER_MUTATION,
  REVISE_COVER_LETTER_MUTATION,
  GENERATE_ANSWER_MUTATION,
  REVISE_ANSWER_MUTATION,
} from './job-agent';
