/**
 * GraphQL Queries and Mutations
 * Centralized query definitions for the career data API
 */

import { gql } from 'graphql-request';

// ============================================================================
// EXPERIENCE QUERIES & MUTATIONS
// ============================================================================

export const EXPERIENCES_QUERY = gql`
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
        description
        metrics
        impact
        keywords
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
        description
        metrics
        impact
        keywords
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
  mutation UpdateExperience($id: ID!, $input: ExperienceInput!) {
    updateExperience(id: $id, input: $input) {
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
        description
        metrics
        impact
        keywords
      }
      technologies
      organizations
      crossFunctional
      displayOrder
      featured
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

// ============================================================================
// SKILLS QUERIES & MUTATIONS
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

export const CREATE_SKILL_MUTATION = gql`
  mutation CreateSkill($input: SkillInput!) {
    createSkill(input: $input) {
      id
      name
    }
  }
`;

export const UPDATE_SKILL_MUTATION = gql`
  mutation UpdateSkill($id: ID!, $input: SkillInput!) {
    updateSkill(id: $id, input: $input) {
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

// ============================================================================
// PROJECT QUERIES & MUTATIONS
// ============================================================================

export const PROJECTS_QUERY = gql`
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
        type
        url
        linkText
      }
      createdAt
      updatedAt
    }
  }
`;

export const PROJECT_QUERY = gql`
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
        type
        url
        linkText
      }
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_PROJECT_MUTATION = gql`
  mutation CreateProject($input: ProjectInput!) {
    createProject(input: $input) {
      id
      name
    }
  }
`;

export const UPDATE_PROJECT_MUTATION = gql`
  mutation UpdateProject($id: ID!, $input: ProjectInput!) {
    updateProject(id: $id, input: $input) {
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
        type
        url
        linkText
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

// ============================================================================
// PROFILE QUERIES & MUTATIONS
// ============================================================================

export const PROFILE_QUERY = gql`
  query GetProfile {
    profile {
      id
      personalInfo {
        name
        email
        phone
        location
        links {
          portfolio
          github
          linkedin
          writingSamples
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

export const UPDATE_PROFILE_MUTATION = gql`
  mutation UpdateProfile($input: ProfileInput!) {
    updateProfile(input: $input) {
      id
      personalInfo {
        name
        email
        phone
        location
        links {
          portfolio
          github
          linkedin
          writingSamples
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
// EDUCATION QUERIES & MUTATIONS
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
  mutation UpdateEducation($id: ID!, $input: EducationInput!) {
    updateEducation(id: $id, input: $input) {
      id
      institution
      degree
      field
      graduationYear
      relevantCoursework
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
