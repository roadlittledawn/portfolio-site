import { useState, useEffect } from 'react';
import { getGraphQLClient } from '../../../lib/graphql-client';
import { EDUCATIONS_QUERY, DELETE_EDUCATION_MUTATION } from '../../../lib/graphql';
import type { Education, EducationsResponse, DeleteEducationResponse } from '../../../lib/types';
import { Button, Card, ErrorState, LoadingState, EmptyState } from '../ui';
import { ConfirmModal } from '../ui/Modal';

export default function EducationPage() {
  const [educations, setEducations] = useState<Education[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchEducations();
  }, []);

  const fetchEducations = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const client = getGraphQLClient();
      const data = await client.request<EducationsResponse>(EDUCATIONS_QUERY);
      // Sort by graduation year (most recent first)
      const sorted = [...(data.educations || [])].sort((a, b) => {
        return b.graduationYear - a.graduationYear;
      });
      setEducations(sorted);
    } catch (err) {
      console.error('Failed to fetch education:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch education');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      const client = getGraphQLClient();
      await client.request<DeleteEducationResponse>(DELETE_EDUCATION_MUTATION, { id: deleteId });
      setEducations(educations.filter(e => e.id !== deleteId));
    } catch (err) {
      console.error('Failed to delete education:', err);
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  if (isLoading) {
    return <LoadingState message="Loading education..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchEducations} />;
  }

  if (educations.length === 0) {
    return (
      <EmptyState
        title="No education entries found"
        description="Add your educational background to get started."
        action={{
          label: "Add First Education",
          href: "/admin/education/new"
        }}
      />
    );
  }

  return (
    <>
      <div className="space-y-3">
        {educations.map((edu) => (
          <div
            key={edu.id}
            className="flex items-center justify-between p-4 bg-dark-card border border-dark-border rounded-lg hover:border-dark-hover transition-colors"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h3 className="font-medium text-text-primary">{edu.degree}</h3>
                <span className="text-text-muted">in</span>
                <span className="text-accent-blue">{edu.field}</span>
              </div>
              <div className="flex items-center gap-4 mt-1 text-sm text-text-muted">
                <span>{edu.institution}</span>
                <span>Class of {edu.graduationYear}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 ml-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => (window.location.href = `/admin/education/${edu.id}`)}
              >
                View
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => (window.location.href = `/admin/education/${edu.id}/edit`)}
              >
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDeleteId(edu.id)}
                className="text-red-400 hover:text-red-300"
              >
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>

      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Education"
        message="Are you sure you want to delete this education entry? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        isLoading={isDeleting}
      />
    </>
  );
}
