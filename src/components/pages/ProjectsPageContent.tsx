import { useState, useEffect, useMemo } from 'react';
import { getGraphQLClient } from '../../lib/graphql-client';
import { PROJECTS_QUERY } from '../../lib/graphql/queries';
import type { Project } from '../../lib/types';

interface ProjectsResponse {
  projects: Project[];
}

export default function ProjectsPageContent() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const client = getGraphQLClient();
      const data = await client.request<ProjectsResponse>(PROJECTS_QUERY);
      setProjects(data.projects);
    } catch (err) {
      console.error('Failed to fetch projects:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch projects');
    } finally {
      setIsLoading(false);
    }
  };

  // Count projects by focus
  const engineeringCount = projects.filter(
    (p) =>
      p.roleTypes?.includes('software_engineer') || p.roleTypes?.includes('engineering_manager')
  ).length;
  const writingCount = projects.filter(
    (p) =>
      p.roleTypes?.includes('technical_writer') ||
      p.roleTypes?.includes('technical_writing_manager')
  ).length;

  // Filter and sort projects
  const filteredProjects = useMemo(() => {
    let result = [...projects];

    // Apply focus filter
    if (filter === 'engineering') {
      result = result.filter(
        (p) =>
          p.roleTypes?.includes('software_engineer') ||
          p.roleTypes?.includes('engineering_manager')
      );
    } else if (filter === 'writing') {
      result = result.filter(
        (p) =>
          p.roleTypes?.includes('technical_writer') ||
          p.roleTypes?.includes('technical_writing_manager')
      );
    }

    // Sort: featured first, then by name
    result.sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return a.name.localeCompare(b.name);
    });

    return result;
  }, [projects, filter]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-text-secondary">Loading projects...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <div className="p-6 bg-dark-card border border-dark-border rounded-lg text-center">
          <p className="text-accent-pink mb-4">{error}</p>
          <button
            onClick={fetchProjects}
            className="px-4 py-2 bg-accent-blue text-text-inverse rounded-lg hover:bg-accent-blue/80 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Filter Navigation */}
      <div className="flex flex-wrap gap-2 bg-dark-layer p-4 rounded-lg">
        {[
          { value: 'all', label: 'All Projects', count: projects.length },
          { value: 'engineering', label: 'Engineering', count: engineeringCount },
          { value: 'writing', label: 'Writing', count: writingCount },
        ].map((opt) => (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === opt.value
                ? 'bg-accent-blue text-text-inverse'
                : 'bg-dark-card text-text-secondary hover:bg-dark-hover'
            }`}
          >
            {opt.label} ({opt.count})
          </button>
        ))}
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {filteredProjects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-12 text-text-muted">No projects match the current filter.</div>
      )}

      {/* Project Stats */}
      <div className="mt-12 pt-8 border-t border-dark-border">
        <div className="text-center">
          <p className="text-text-secondary">
            <span className="font-semibold text-accent-blue text-lg">{projects.length}</span> projects
            showcasing{' '}
            <span className="font-semibold text-accent-blue text-lg">{engineeringCount}</span>{' '}
            engineering and{' '}
            <span className="font-semibold text-accent-blue text-lg">{writingCount}</span> writing
            initiatives
          </p>
        </div>
      </div>
    </div>
  );
}

// Project Card Component
function ProjectCard({ project }: { project: Project }) {
  // Generate slug from project name
  const slug = project.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  return (
    <a
      href={`/projects/${slug}`}
      className="block bg-dark-card border border-dark-border rounded-lg p-6 hover:bg-dark-hover hover:border-dark-border transition-all hover:-translate-y-1"
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-xl font-semibold text-text-primary">{project.name}</h3>
        {project.featured && (
          <span className="px-2 py-1 bg-accent-amber/20 text-accent-amber text-xs font-medium rounded">
            Featured
          </span>
        )}
      </div>

      <p className="text-text-secondary mb-4 line-clamp-3">{project.overview}</p>

      <div className="flex flex-wrap gap-2 mb-4">
        {project.roleTypes?.map((role) => (
          <span
            key={role}
            className={`px-2 py-1 text-xs font-medium rounded ${
              role.includes('engineer')
                ? 'bg-accent-blue/20 text-accent-blue'
                : 'bg-accent-green/20 text-accent-green'
            }`}
          >
            {role.replace(/_/g, ' ')}
          </span>
        ))}
      </div>

      {project.technologies && project.technologies.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {project.technologies.slice(0, 5).map((tech) => (
            <span key={tech} className="px-2 py-0.5 bg-dark-layer text-xs text-text-muted rounded">
              {tech}
            </span>
          ))}
          {project.technologies.length > 5 && (
            <span className="px-2 py-0.5 text-xs text-text-muted">
              +{project.technologies.length - 5} more
            </span>
          )}
        </div>
      )}

      {project.links && project.links.length > 0 && (
        <div className="mt-4 pt-4 border-t border-dark-border-subtle flex gap-3">
          {project.links.slice(0, 2).map((link, idx) => (
            <span key={idx} className="text-sm text-accent-blue">
              {link.linkText || link.type}
            </span>
          ))}
        </div>
      )}
    </a>
  );
}
