import { useState, useEffect } from 'react';
import { getGraphQLClient } from '../../lib/graphql-client';
import { PROJECT_QUERY } from '../../lib/graphql';
import type { Project, ProjectResponse } from '../../lib/types';

export default function ProjectDetailPageContent() {
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProject();
  }, []);

  const fetchProject = async () => {
    try {
      const pathParts = window.location.pathname.split('/');
      const id = pathParts[pathParts.length - 1];

      const client = getGraphQLClient();
      const data = await client.request<ProjectResponse>(PROJECT_QUERY, { id });

      if (data.project) {
        setProject(data.project);
      } else {
        setError('Project not found');
      }
    } catch (err) {
      console.error('Failed to fetch project:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch project');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  };

  const getProjectType = (type: string) => {
    const types: Record<string, { label: string; colorClass: string }> = {
      engineering: { label: 'Engineering', colorClass: 'bg-accent-blue/20 text-accent-blue' },
      writing: { label: 'Writing', colorClass: 'bg-accent-green/20 text-accent-green' },
      leadership: { label: 'Leadership', colorClass: 'bg-accent-purple/20 text-accent-purple' },
    };
    return types[type] || types.engineering;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-text-secondary">Loading project...</div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <div className="p-6 bg-dark-card border border-dark-border rounded-lg text-center">
          <p className="text-accent-pink mb-4">{error || 'Project not found'}</p>
          <a
            href="/projects"
            className="inline-block px-4 py-2 bg-accent-blue text-text-inverse rounded-lg hover:bg-accent-blue/80 transition-colors"
          >
            Back to Projects
          </a>
        </div>
      </div>
    );
  }

  const typeInfo = getProjectType(project.type);
  const links = project.links ?? [];

  const getLinkIcon = (type: string) => {
    if (type === 'github') {
      return (
        <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
        </svg>
      );
    }
    if (type === 'website') {
      return (
        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
      );
    }
    if (type === 'demo' || type.startsWith('demo')) {
      return (
        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      );
    }
    // Default: link icon
    return (
      <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    );
  };

  return (
    <div className="container mx-auto px-4 max-w-6xl">
      {/* Hero Section */}
      <div className="pt-8 pb-12 border-b border-dark-border">
        <div className="mb-6">
          <a
            href="/projects"
            className="inline-flex items-center gap-2 text-accent-blue hover:text-accent-blue/80 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Projects
          </a>
        </div>

        <h1 className="text-4xl font-bold text-text-primary mb-4">{project.name}</h1>

        <div className="flex flex-wrap items-center gap-4 mb-6">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${typeInfo.colorClass}`}>
            {typeInfo.label}
          </span>

          {project.date && <span className="text-text-secondary">{formatDate(project.date)}</span>}

        </div>

        {project.overview && (
          <p className="text-xl text-text-secondary leading-relaxed">{project.overview}</p>
        )}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 py-12">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Challenge */}
          {project.challenge && (
            <section>
              <h2 className="text-2xl font-semibold text-text-primary mb-4">The Challenge</h2>
              <p className="text-text-secondary leading-relaxed">{project.challenge}</p>
            </section>
          )}

          {/* Approach */}
          {project.approach && (
            <section>
              <h2 className="text-2xl font-semibold text-text-primary mb-4">Approach</h2>
              <p className="text-text-secondary leading-relaxed">{project.approach}</p>
            </section>
          )}

          {/* Outcome */}
          {project.outcome && (
            <section>
              <h2 className="text-2xl font-semibold text-text-primary mb-4">Outcome</h2>
              <p className="text-text-secondary leading-relaxed">{project.outcome}</p>
            </section>
          )}

          {/* Impact */}
          {project.impact && (
            <section>
              <h2 className="text-2xl font-semibold text-text-primary mb-4">Impact</h2>
              <p className="text-text-secondary leading-relaxed">{project.impact}</p>
            </section>
          )}

          {/* Technologies Used */}
          {project.technologies && project.technologies.length > 0 && (
            <section>
              <h2 className="text-2xl font-semibold text-text-primary mb-4">Technologies</h2>
              <div className="flex flex-wrap gap-2">
                {project.technologies.map((tech) => (
                  <span
                    key={tech}
                    className="px-3 py-1.5 bg-dark-layer text-text-secondary rounded-lg text-sm"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Links Card */}
          {links.length > 0 && (
            <div className="bg-dark-card rounded-xl p-6 border border-dark-border">
              <h3 className="text-lg font-semibold text-text-primary mb-4">Project Links</h3>
              <div className="space-y-3">
                {links.map((link, idx) => (
                  <a
                    key={idx}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-text-secondary hover:text-accent-blue transition-colors"
                  >
                    {getLinkIcon(link.type)}
                    {link.linkText || link.type}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Role Types */}
          {project.roleTypes && project.roleTypes.length > 0 && (
            <div className="bg-dark-card rounded-xl p-6 border border-dark-border">
              <h3 className="text-lg font-semibold text-text-primary mb-4">Focus Areas</h3>
              <div className="flex flex-wrap gap-2">
                {project.roleTypes.map((role) => (
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
