import { useState, useEffect } from 'react';
import { getGraphQLClient } from '../../../lib/graphql-client';
import { EXPERIENCES_QUERY, DELETE_EXPERIENCE_MUTATION } from '../../../lib/graphql/queries';
import type { Experience } from '../../../lib/types';
import ExperiencesList from '../lists/ExperiencesList';

interface ExperiencesResponse {
  experiences: Experience[];
}

interface DeleteResponse {
  deleteExperience: {
    success: boolean;
    id: string;
  };
}

export default function ExperiencesPage() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchExperiences();
  }, []);

  const fetchExperiences = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const client = getGraphQLClient();
      const data = await client.request<ExperiencesResponse>(EXPERIENCES_QUERY);
      // Sort by displayOrder, then by startDate (most recent first)
      const sorted = [...(data.experiences || [])].sort((a, b) => {
        if (a.displayOrder !== b.displayOrder) {
          return a.displayOrder - b.displayOrder;
        }
        return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
      });
      setExperiences(sorted);
    } catch (err) {
      console.error('Failed to fetch experiences:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch experiences');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (experience: Experience) => {
    window.location.href = `/admin/experiences/${experience.id}/edit`;
  };

  const handleDelete = async (id: string) => {
    try {
      const client = getGraphQLClient();
      await client.request<DeleteResponse>(DELETE_EXPERIENCE_MUTATION, { id });
      setExperiences(experiences.filter(exp => exp.id !== id));
    } catch (err) {
      console.error('Failed to delete experience:', err);
      throw err;
    }
  };

  if (error) {
    return (
      <div className="p-6 bg-red-900/20 border border-red-500/50 rounded-lg text-center">
        <p className="text-red-400 mb-4">{error}</p>
        <button
          onClick={fetchExperiences}
          className="px-4 py-2 bg-accent-blue hover:bg-accent-blue/80 text-white font-medium rounded-lg transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <ExperiencesList
      experiences={experiences}
      onEdit={handleEdit}
      onDelete={handleDelete}
      isLoading={isLoading}
    />
  );
}
