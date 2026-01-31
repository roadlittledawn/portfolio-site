import { useState, useEffect } from 'react';
import { getGraphQLClient } from '../../../lib/graphql-client';
import { EDUCATION_QUERY, DELETE_EDUCATION_MUTATION } from '../../../lib/graphql/queries';
import type { Education } from '../../../lib/types';
import { Button, Card } from '../ui';
import { ConfirmModal } from '../ui/Modal';

interface EducationDetailPageProps {
  educationId: string;
}

interface EducationResponse {
  education: Education | null;
}

export default function EducationDetailPage({ educationId }: EducationDetailPageProps) {
  const [education, setEducation] = useState<Education | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchEducation();
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

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const client = getGraphQLClient();
      await client.request(DELETE_EDUCATION_MUTATION, { id: educationId });
      window.location.href = '/admin/education';
    } catch (err) {
      console.error('Failed to delete education:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete education');
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
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
        <Button onClick={fetchEducation}>Retry</Button>
      </div>
    );
  }

  if (!education) {
    return (
      <div className="p-6 bg-dark-card border border-dark-border rounded-lg text-center">
        <p className="text-text-secondary">Education not found</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header with actions */}
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-text-primary">{education.degree}</h2>
            <p className="text-lg text-accent-blue">{education.field}</p>
            <p className="text-text-muted">{education.institution} | Class of {education.graduationYear}</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => window.location.href = `/admin/education/${educationId}/edit`}
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

        {/* Details */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-text-muted">Institution</label>
                <p className="text-text-primary">{education.institution}</p>
              </div>
              <div>
                <label className="text-sm text-text-muted">Degree</label>
                <p className="text-text-primary">{education.degree}</p>
              </div>
              <div>
                <label className="text-sm text-text-muted">Field of Study</label>
                <p className="text-text-primary">{education.field}</p>
              </div>
              <div>
                <label className="text-sm text-text-muted">Graduation Year</label>
                <p className="text-text-primary">{education.graduationYear}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Metadata */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-3">Metadata</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-text-muted">Created:</span>
                <span className="ml-2 text-text-primary">
                  {new Date(education.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="text-text-muted">Updated:</span>
                <span className="ml-2 text-text-primary">
                  {new Date(education.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
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
