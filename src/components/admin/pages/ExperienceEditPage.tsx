import { useState, useEffect } from 'react';
import { getGraphQLClient } from '../../../lib/graphql-client';
import { EXPERIENCE_QUERY, UPDATE_EXPERIENCE_MUTATION, CREATE_EXPERIENCE_MUTATION } from '../../../lib/graphql';
import type { Experience } from '../../../lib/types';
import ExperienceForm from '../forms/ExperienceForm';

interface ExperienceEditPageProps {
  experienceId?: string; // Optional - if not provided, it's a create form
}

interface ExperienceResponse {
  experience: Experience | null;
}

export default function ExperienceEditPage({ experienceId }: ExperienceEditPageProps) {
  const [experience, setExperience] = useState<Experience | null>(null);
  const [isLoading, setIsLoading] = useState(!!experienceId);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (experienceId) {
      fetchExperience();
    }
  }, [experienceId]);

  const fetchExperience = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const client = getGraphQLClient();
      const data = await client.request<ExperienceResponse>(EXPERIENCE_QUERY, { id: experienceId });
      setExperience(data.experience);
    } catch (err) {
      console.error('Failed to fetch experience:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch experience');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (data: Partial<Experience>) => {
    const client = getGraphQLClient();

    if (experienceId) {
      // Update existing
      await client.request(UPDATE_EXPERIENCE_MUTATION, { id: experienceId, input: data });
    } else {
      // Create new
      await client.request(CREATE_EXPERIENCE_MUTATION, { input: data });
    }

    window.location.href = '/admin/experiences';
  };

  const handleCancel = () => {
    window.location.href = '/admin/experiences';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-text-secondary">Loading experience...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-900/20 border border-red-500/50 rounded-lg text-center">
        <p className="text-red-400 mb-4">{error}</p>
        <button
          onClick={fetchExperience}
          className="px-4 py-2 bg-accent-blue hover:bg-accent-blue/80 text-white font-medium rounded-lg transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (experienceId && !experience) {
    return (
      <div className="p-6 bg-dark-card border border-dark-border rounded-lg text-center">
        <p className="text-text-secondary">Experience not found</p>
      </div>
    );
  }

  return (
    <ExperienceForm
      initialData={experience || undefined}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
    />
  );
}
