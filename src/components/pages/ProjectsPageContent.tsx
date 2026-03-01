import { useState, useEffect, useMemo } from 'react';
import { getGraphQLClient } from '../../lib/graphql-client';
import { PROJECTS_QUERY } from '../../lib/graphql';
import type { Project, ProjectsResponse } from '../../lib/types';
import ProjectCard, { FeaturedProjectCard } from '../ProjectCard';

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

  const engineeringCount = projects.filter(
    (p) =>
      p.roleTypes?.includes('software_engineer') || p.roleTypes?.includes('engineering_manager')
  ).length;
  const writingCount = projects.filter(
    (p) =>
      p.roleTypes?.includes('technical_writer') ||
      p.roleTypes?.includes('technical_writing_manager')
  ).length;

  const { featuredProjects, regularProjects } = useMemo(() => {
    let result = [...projects];

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

    const byDateDesc = (a: Project, b: Project) => {
      const ta = a.date ? new Date(a.date).getTime() : 0;
      const tb = b.date ? new Date(b.date).getTime() : 0;
      return tb - ta;
    };

    return {
      featuredProjects: result.filter((p) => p.featured).sort(byDateDesc),
      regularProjects: result.filter((p) => !p.featured).sort(byDateDesc),
    };
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

  const totalCount = featuredProjects.length + regularProjects.length;

  return (
    <div className="space-y-10">
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

      {totalCount === 0 && (
        <div className="text-center py-12 text-text-muted">No projects match the current filter.</div>
      )}

      {/* Featured Projects */}
      {featuredProjects.length > 0 && (
        <section className="space-y-6">
          {featuredProjects.map((project) => (
            <FeaturedProjectCard key={project.id} project={project} />
          ))}
        </section>
      )}

      {/* Regular Projects */}
      {regularProjects.length > 0 && (
        <section>
          {featuredProjects.length > 0 && (
            <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-text-muted mb-5">
              More Projects
            </h2>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {regularProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
