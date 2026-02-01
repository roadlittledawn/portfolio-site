import { useState, useEffect, useMemo } from 'react';
import { getGraphQLClient } from '../../lib/graphql-client';
import { SKILLS_QUERY, PROJECTS_QUERY, EXPERIENCES_QUERY, PROFILE_QUERY } from '../../lib/graphql/queries';
import type { Skill, Project, Experience, Profile } from '../../lib/types';

interface RoleLandingPageContentProps {
  roleType: 'engineering' | 'writing';
}

interface DataResponse {
  skills: Skill[];
  projects: Project[];
  experiences: Experience[];
  profile: Profile;
}

const engineeringStrengths = [
  {
    title: 'Full-Stack Development',
    description: 'React, Node.js, GraphQL, and modern web application architecture',
  },
  {
    title: 'Engineering Leadership',
    description: 'Team building, hiring, mentoring, and scaling engineering organizations',
  },
  {
    title: 'Developer Experience',
    description: 'Content tooling, CI/CD, performance optimization, and developer productivity',
  },
  {
    title: 'Content Driven Apps',
    description: 'Cost effective content management systems, contributor enablement',
  },
];

const writingStrengths = [
  {
    title: 'Documentation Systems',
    description: 'Docs-as-code, content reuse, style guides, and culture of documentation',
  },
  {
    title: 'Developer Experience',
    description: 'API documentation, technical tutorials, and developer-focused content strategy',
  },
  {
    title: 'Content Leadership',
    description: 'Team management, content strategy, and scaling documentation processes',
  },
  {
    title: 'Technical Tools',
    description: 'Modern publishing workflows, internationalization, and content tooling',
  },
];

export default function RoleLandingPageContent({ roleType }: RoleLandingPageContentProps) {
  const [data, setData] = useState<DataResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const client = getGraphQLClient();
      const [skillsRes, projectsRes, experiencesRes, profileRes] = await Promise.all([
        client.request<{ skills: Skill[] }>(SKILLS_QUERY),
        client.request<{ projects: Project[] }>(PROJECTS_QUERY),
        client.request<{ experiences: Experience[] }>(EXPERIENCES_QUERY),
        client.request<{ profile: Profile }>(PROFILE_QUERY),
      ]);

      setData({
        skills: skillsRes.skills,
        projects: projectsRes.projects,
        experiences: experiencesRes.experiences,
        profile: profileRes.profile,
      });
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter data based on role type
  const filteredData = useMemo(() => {
    if (!data) return null;

    const roleFilters =
      roleType === 'engineering'
        ? ['software_engineer', 'engineering_manager', 'engineering']
        : ['technical_writer', 'technical_writing_manager', 'technical_writing', 'writing'];

    const skills = data.skills
      .filter((skill) => skill.roleRelevance?.some((r) => roleFilters.includes(r)))
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 12);

    const projects = data.projects
      .filter((project) => project.roleTypes?.some((r) => roleFilters.includes(r)))
      .filter((project) => project.featured);

    const experiences = data.experiences
      .filter((exp) => exp.roleTypes?.some((r) => roleFilters.includes(r)))
      .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

    const positioning =
      roleType === 'engineering'
        ? data.profile?.positioning?.byRole?.software_engineer
        : data.profile?.positioning?.byRole?.technical_writer;

    return { skills, projects, experiences, positioning };
  }, [data, roleType]);

  const strengths = roleType === 'engineering' ? engineeringStrengths : writingStrengths;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-secondary">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!filteredData) return null;

  return (
    <div>
      {/* Hero Description */}
      {filteredData.positioning && (
        <div className="max-w-3xl mx-auto text-center mb-12">
          <p className="text-lg text-secondary">{filteredData.positioning}</p>
        </div>
      )}

      {/* Core Expertise */}
      <section className="py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-dark mb-4">Core Expertise</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {strengths.map((strength, idx) => (
            <div key={idx} className="bg-white border border-border rounded-lg p-6 text-center">
              <h3 className="text-lg font-semibold text-primary-dark mb-2">{strength.title}</h3>
              <p className="text-secondary text-sm">{strength.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Projects */}
      {filteredData.projects.length > 0 && (
        <section className="py-16 bg-bg-light">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-primary-dark mb-4">
                {roleType === 'engineering' ? 'Engineering Projects' : 'Writing Projects'}
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {filteredData.projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>

            <div className="text-center mt-8">
              <a
                href="/projects"
                className="inline-block px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
              >
                View All Projects
              </a>
            </div>
          </div>
        </section>
      )}

      {/* Top Skills */}
      {filteredData.skills.length > 0 && (
        <section className="py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-dark mb-4">Top Skills</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredData.skills.map((skill) => (
              <div
                key={skill.id}
                className="bg-white border border-border rounded-lg p-4 flex items-center justify-between"
              >
                <div>
                  <h4 className="font-medium text-primary-dark">{skill.name}</h4>
                  <span className="text-xs text-muted">{skill.level}</span>
                </div>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`text-sm ${star <= skill.rating ? 'text-accent' : 'text-gray-300'}`}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <a
              href="/skills"
              className="inline-block px-6 py-3 border border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition-colors"
            >
              View All Skills
            </a>
          </div>
        </section>
      )}

      {/* Experience Timeline */}
      {filteredData.experiences.length > 0 && (
        <section className="py-16 bg-bg-light">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-primary-dark mb-4">
                {roleType === 'engineering' ? 'Engineering Experience' : 'Writing Experience'}
              </h2>
            </div>

            <div className="space-y-6">
              {filteredData.experiences.slice(0, 4).map((exp) => (
                <div
                  key={exp.id}
                  className="bg-white border border-border rounded-lg p-6"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-primary-dark">{exp.title}</h3>
                    <span className="text-sm text-muted">
                      {formatDate(exp.startDate)} - {exp.endDate ? formatDate(exp.endDate) : 'Present'}
                    </span>
                  </div>
                  <p className="text-primary mb-2">{exp.company}</p>
                  {exp.summary && <p className="text-secondary text-sm">{exp.summary}</p>}
                </div>
              ))}
            </div>

            <div className="text-center mt-8">
              <a
                href="/experience"
                className="inline-block px-6 py-3 border border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition-colors"
              >
                View Full Experience
              </a>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

// Project Card Component
function ProjectCard({ project }: { project: Project }) {
  const slug = project.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  return (
    <a
      href={`/projects/${slug}`}
      className="block bg-white border border-border rounded-lg p-6 hover:shadow-lg transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-xl font-semibold text-primary-dark">{project.name}</h3>
        {project.featured && (
          <span className="px-2 py-1 bg-accent/10 text-accent text-xs font-medium rounded">
            Featured
          </span>
        )}
      </div>
      <p className="text-secondary mb-4 line-clamp-2">{project.overview}</p>
      {project.technologies && project.technologies.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {project.technologies.slice(0, 4).map((tech) => (
            <span key={tech} className="px-2 py-0.5 bg-bg-light text-xs text-muted rounded">
              {tech}
            </span>
          ))}
        </div>
      )}
    </a>
  );
}
