import { useState, useEffect } from 'react';
import { getGraphQLClient } from '../../../lib/graphql-client';
import { PROJECT_QUERY, DELETE_PROJECT_MUTATION } from '../../../lib/graphql';
import type { Project } from '../../../lib/types';
import { Button, Card, Badge } from '../ui';
import { ConfirmModal } from '../ui/Modal';

interface ProjectDetailPageProps {
  projectId: string;
}

interface ProjectResponse {
  project: Project | null;
}

export default function ProjectDetailPage({ projectId }: ProjectDetailPageProps) {
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  const fetchProject = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const client = getGraphQLClient();
      const data = await client.request<ProjectResponse>(PROJECT_QUERY, { id: projectId });
      setProject(data.project);
    } catch (err) {
      console.error('Failed to fetch project:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch project');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const client = getGraphQLClient();
      await client.request(DELETE_PROJECT_MUTATION, { id: projectId });
      window.location.href = '/admin/projects';
    } catch (err) {
      console.error('Failed to delete project:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete project');
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-text-secondary">Loading project...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-900/20 border border-red-500/50 rounded-lg text-center">
        <p className="text-red-400 mb-4">{error}</p>
        <Button onClick={fetchProject}>Retry</Button>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-6 bg-dark-card border border-dark-border rounded-lg text-center">
        <p className="text-text-secondary">Project not found</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header with actions */}
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold text-text-primary">{project.name}</h2>
              <Badge>{project.type}</Badge>
              {project.featured && <Badge variant="primary">Featured</Badge>}
            </div>
            {project.date && (
              <p className="text-text-muted">{new Date(project.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => window.location.href = `/admin/projects/${projectId}/edit`}
            >
              Edit
            </Button>
            <Button
              variant="secondary"
              onClick={() => setShowDeleteModal(true)}
              className="text-red-400 hover:text-red-300"
            >
              Delete
            </Button>
          </div>
        </div>

        {/* Overview */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-3">Overview</h3>
            <p className="text-text-secondary">{project.overview}</p>
          </div>
        </Card>

        {/* Challenge, Approach, Outcome */}
        {(project.challenge || project.approach || project.outcome) && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {project.challenge && (
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-text-primary mb-3">Challenge</h3>
                  <p className="text-text-secondary text-sm">{project.challenge}</p>
                </div>
              </Card>
            )}
            {project.approach && (
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-text-primary mb-3">Approach</h3>
                  <p className="text-text-secondary text-sm">{project.approach}</p>
                </div>
              </Card>
            )}
            {project.outcome && (
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-text-primary mb-3">Outcome</h3>
                  <p className="text-text-secondary text-sm">{project.outcome}</p>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Impact */}
        {project.impact && (
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-3">Impact</h3>
              <p className="text-text-secondary">{project.impact}</p>
            </div>
          </Card>
        )}

        {/* Role Types */}
        {project.roleTypes && project.roleTypes.length > 0 && (
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-3">Role Types</h3>
              <div className="flex flex-wrap gap-2">
                {project.roleTypes.map((role) => (
                  <Badge key={role}>{role.replace(/_/g, ' ')}</Badge>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* Technologies */}
        {project.technologies && project.technologies.length > 0 && (
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-3">Technologies</h3>
              <div className="flex flex-wrap gap-2">
                {project.technologies.map((tech) => (
                  <span
                    key={tech}
                    className="px-3 py-1 bg-dark-hover text-text-secondary rounded-full text-sm"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* Links */}
        {project.links && project.links.length > 0 && (
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-3">Links</h3>
              <div className="space-y-2">
                {project.links.map((link, index) => (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-accent-blue hover:underline"
                  >
                    <span>{link.linkText || link.type}</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* Keywords */}
        {project.keywords && project.keywords.length > 0 && (
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-3">Keywords</h3>
              <div className="flex flex-wrap gap-2">
                {project.keywords.map((keyword) => (
                  <span
                    key={keyword}
                    className="px-3 py-1 bg-accent-blue/20 text-accent-blue rounded-full text-sm"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          </Card>
        )}
      </div>

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Project"
        message="Are you sure you want to delete this project? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        isLoading={isDeleting}
      />
    </>
  );
}
