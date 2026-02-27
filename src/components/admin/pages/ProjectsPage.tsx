import { useState, useEffect } from 'react';
import { getGraphQLClient } from '../../../lib/graphql-client';
import { PROJECTS_QUERY, DELETE_PROJECT_MUTATION } from '../../../lib/graphql';
import type { Project, ProjectsResponse, DeleteProjectResponse } from '../../../lib/types';
import { ErrorState } from '../ui';
import ProjectsList from '../lists/ProjectsList';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const client = getGraphQLClient();
      const data = await client.request<ProjectsResponse>(PROJECTS_QUERY);
      // Sort by featured first, then by date (most recent first)
      const sorted = [...(data.projects || [])].sort((a, b) => {
        if (a.featured !== b.featured) {
          return a.featured ? -1 : 1;
        }
        if (a.date && b.date) {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        }
        return a.name.localeCompare(b.name);
      });
      setProjects(sorted);
    } catch (err) {
      console.error('Failed to fetch projects:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch projects');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (project: Project) => {
    window.location.href = `/admin/projects/${project.id}/edit`;
  };

  const handleDelete = async (id: string) => {
    try {
      const client = getGraphQLClient();
      await client.request<DeleteProjectResponse>(DELETE_PROJECT_MUTATION, { id });
      setProjects(projects.filter(p => p.id !== id));
    } catch (err) {
      console.error('Failed to delete project:', err);
      throw err;
    }
  };

  if (error) {
    return <ErrorState message={error} onRetry={fetchProjects} />;
  }

  return (
    <ProjectsList
      projects={projects}
      onEdit={handleEdit}
      onDelete={handleDelete}
      isLoading={isLoading}
    />
  );
}
