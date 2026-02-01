/**
 * GraphQL Fragments
 * Shared field definitions to reduce duplication across queries
 */

import { gql } from "graphql-request";

// ============================================================================
// EXPERIENCE FRAGMENTS
// ============================================================================

export const ACHIEVEMENT_FIELDS = gql`
  fragment AchievementFields on Achievement {
    description
    metrics
    impact
    keywords
  }
`;

export const EXPERIENCE_CORE_FIELDS = gql`
  fragment ExperienceCoreFields on Experience {
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
    technologies
    organizations
    crossFunctional
    displayOrder
    featured
  }
`;

export const EXPERIENCE_FULL_FIELDS = gql`
  ${ACHIEVEMENT_FIELDS}
  ${EXPERIENCE_CORE_FIELDS}
  fragment ExperienceFullFields on Experience {
    ...ExperienceCoreFields
    achievements {
      ...AchievementFields
    }
    createdAt
    updatedAt
  }
`;

// ============================================================================
// SKILL FRAGMENTS
// ============================================================================

export const SKILL_CORE_FIELDS = gql`
  fragment SkillCoreFields on Skill {
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
  }
`;

export const SKILL_FULL_FIELDS = gql`
  ${SKILL_CORE_FIELDS}
  fragment SkillFullFields on Skill {
    ...SkillCoreFields
    createdAt
    updatedAt
  }
`;

// ============================================================================
// PROJECT FRAGMENTS
// ============================================================================

export const PROJECT_LINK_FIELDS = gql`
  fragment ProjectLinkFields on Link {
    type
    url
    linkText
  }
`;

export const PROJECT_CORE_FIELDS = gql`
  fragment ProjectCoreFields on Project {
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
  }
`;

export const PROJECT_FULL_FIELDS = gql`
  ${PROJECT_LINK_FIELDS}
  ${PROJECT_CORE_FIELDS}
  fragment ProjectFullFields on Project {
    ...ProjectCoreFields
    links {
      ...ProjectLinkFields
    }
    createdAt
    updatedAt
  }
`;

// ============================================================================
// PROFILE FRAGMENTS
// ============================================================================

export const PROFILE_LINKS_FIELDS = gql`
  fragment ProfileLinksFields on Links {
    portfolio
    github
    linkedin
    writingSamples
  }
`;

export const PERSONAL_INFO_FIELDS = gql`
  ${PROFILE_LINKS_FIELDS}
  fragment PersonalInfoFields on PersonalInfo {
    name
    email
    phone
    location
    links {
      ...ProfileLinksFields
    }
  }
`;

export const POSITIONING_FIELDS = gql`
  fragment PositioningFields on Positioning {
    current
    byRole {
      technical_writer
      technical_writing_manager
      software_engineer
      engineering_manager
    }
  }
`;

export const PROFILE_FULL_FIELDS = gql`
  ${PERSONAL_INFO_FIELDS}
  ${POSITIONING_FIELDS}
  fragment ProfileFullFields on Profile {
    id
    personalInfo {
      ...PersonalInfoFields
    }
    positioning {
      ...PositioningFields
    }
    valuePropositions
    professionalMission
    uniqueSellingPoints
    updatedAt
  }
`;

// ============================================================================
// EDUCATION FRAGMENTS
// ============================================================================

export const EDUCATION_CORE_FIELDS = gql`
  fragment EducationCoreFields on Education {
    id
    institution
    degree
    field
    graduationYear
    relevantCoursework
  }
`;

export const EDUCATION_FULL_FIELDS = gql`
  ${EDUCATION_CORE_FIELDS}
  fragment EducationFullFields on Education {
    ...EducationCoreFields
    createdAt
    updatedAt
  }
`;

// ============================================================================
// AI GENERATION FRAGMENTS
// ============================================================================

export const AI_USAGE_FIELDS = gql`
  fragment AIUsageFields on AIUsage {
    inputTokens
    outputTokens
    cacheReadInputTokens
    cacheCreationInputTokens
  }
`;
