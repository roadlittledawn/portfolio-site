import { useState, useEffect } from 'react';
import { getGraphQLClient } from '../../../lib/graphql-client';
import { EDUCATION_QUERY, UPDATE_EDUCATION_MUTATION, CREATE_EDUCATION_MUTATION } from '../../../lib/graphql/queries';
import type { Education } from '../../../lib/types';
import EducationForm from '../forms/EducationForm';

interface EducationEditPageProps {
  educationId?: string;
}

interface EducationResponse {
  education: Education | null;
}

export default function EducationEditPage({ educationId }: EducationEditPageProps) {
  const [education, setEducation] = useState<Education | null>(null);
  const [isLoading, setIsLoading] = useState(!!educationId);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (educationId) {
      fetchEducation();
    }
  }, [educationId]);

  const fetchEducation = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const client = getGraphQLClient();
      const data = await client.request<EducationResponse>(EDUCATION_QUERY, { id: educationId });
      setEducation(data.education);
    } catch (err) {
      console.error('Failed to fetch education:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch education');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (data: Partial<Education>) => {
    const client = getGraphQLClient();

    if (educationId) {
      await client.request(UPDATE_EDUCATION_MUTATION, { id: educationId, input: data });
    } else {
      await client.request(CREATE_EDUCATION_MUTATION, { input: data });
    }

    window.location.href = '/admin/education';
  };

  const handleCancel = () => {
    window.location.href = '/admin/education';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-text-secondary">Loading education...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-900/20 border border-red-500/50 rounded-lg text-center">
        <p className="text-red-400 mb-4">{error}</p>
        <button
          onClick={fetchEducation}
          className="px-4 py-2 bg-accent-blue hover:bg-accent-blue/80 text-white font-medium rounded-lg transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (educationId && !education) {
    return (
      <div className="p-6 bg-dark-card border border-dark-border rounded-lg text-center">
        <p className="text-text-secondary">Education not found</p>
      </div>
    );
  }

  return (
    <EducationForm
      initialData={education || undefined}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
    />
  );
}
