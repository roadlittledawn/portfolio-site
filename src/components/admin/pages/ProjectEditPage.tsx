import { useState, useEffect } from 'react';
import { getGraphQLClient } from '../../../lib/graphql-client';
import { PROJECT_QUERY, UPDATE_PROJECT_MUTATION, CREATE_PROJECT_MUTATION } from '../../../lib/graphql/queries';
import type { Project } from '../../../lib/types';
import ProjectForm from '../forms/ProjectForm';

interface ProjectEditPageProps {
  projectId?: string;
}

interface ProjectResponse {
  project: Project | null;
}

export default function ProjectEditPage({ projectId }: ProjectEditPageProps) {
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(!!projectId);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (projectId) {
      fetchProject();
    }
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

  const handleSubmit = async (data: Partial<Project>) => {
    const client = getGraphQLClient();

    if (projectId) {
      await client.request(UPDATE_PROJECT_MUTATION, { id: projectId, input: data });
    } else {
      await client.request(CREATE_PROJECT_MUTATION, { input: data });
    }

    window.location.href = '/admin/projects';
  };

  const handleCancel = () => {
    window.location.href = '/admin/projects';
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
        <button
          onClick={fetchProject}
          className="px-4 py-2 bg-accent-blue hover:bg-accent-blue/80 text-white font-medium rounded-lg transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (projectId && !project) {
    return (
      <div className="p-6 bg-dark-card border border-dark-border rounded-lg text-center">
        <p className="text-text-secondary">Project not found</p>
      </div>
    );
  }

  return (
    <ProjectForm
      initialData={project || undefined}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
    />
  );
}
