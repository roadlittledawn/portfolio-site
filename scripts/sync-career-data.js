import { GraphQLClient, gql } from 'graphql-request';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// TODO: Skills iconName field may be outdated in the API.
// Manual updates may be required to ensure icons display correctly.
// Consider adding a mapping or fallback mechanism for missing/incorrect icon names.

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GRAPHQL_ENDPOINT = process.env.GRAPHQL_ENDPOINT;
const API_KEY = process.env.GRAPHQL_API_KEY;

if (!GRAPHQL_ENDPOINT) {
  console.error('Error: GRAPHQL_ENDPOINT environment variable is required');
  process.exit(1);
}

const client = new GraphQLClient(GRAPHQL_ENDPOINT, {
  headers: API_KEY ? { 'X-API-Key': API_KEY } : {},
});

const QUERY = gql`
  query GetCareerData {
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
    }
    experiences {
      id
      company
      location
      title
      industry
      startDate
      endDate
      summary
      organizations
      roleTypes
      responsibilities
      achievements {
        description
        metrics
        impact
        keywords
      }
      technologies
      crossFunctional
      displayOrder
      featured
    }
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
    }
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
      links {
        url
        linkText
        type
      }
      roleTypes
    }
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

function sortById(array) {
  return [...array].sort((a, b) => a.id.localeCompare(b.id));
}

async function fetchAndNormalizeData() {
  try {
    console.log('Fetching career data from GraphQL API...');
    const data = await client.request(QUERY);

    const normalized = {
      profile: data.profile,
      experiences: sortById(data.experiences),
      skills: sortById(data.skills),
      projects: sortById(data.projects),
      educations: sortById(data.educations),
    };

    return normalized;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
}

async function main() {
  const dataPath = path.join(__dirname, '../src/data/careerData.json');
  
  let oldData = null;
  if (fs.existsSync(dataPath)) {
    oldData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  }

  const newData = await fetchAndNormalizeData();
  
  const newDataString = JSON.stringify(newData, null, 2);
  const oldDataString = oldData ? JSON.stringify(oldData, null, 2) : '';

  if (newDataString === oldDataString) {
    console.log('No changes detected in career data');
    process.exit(1);
  }

  fs.writeFileSync(dataPath, newDataString);
  console.log('Career data updated successfully');
  process.exit(0);
}

main();
