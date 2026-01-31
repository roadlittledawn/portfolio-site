import { useState, useEffect } from 'react';
import { getGraphQLClient } from '../../../lib/graphql-client';
import { EXPERIENCE_QUERY, DELETE_EXPERIENCE_MUTATION } from '../../../lib/graphql/queries';
import type { Experience } from '../../../lib/types';
import { Button, Card, Badge } from '../ui';
import { ConfirmModal } from '../ui/Modal';

interface ExperienceDetailPageProps {
  experienceId: string;
}

interface ExperienceResponse {
  experience: Experience | null;
}

export default function ExperienceDetailPage({ experienceId }: ExperienceDetailPageProps) {
  const [experience, setExperience] = useState<Experience | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchExperience();
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

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const client = getGraphQLClient();
      await client.request(DELETE_EXPERIENCE_MUTATION, { id: experienceId });
      window.location.href = '/admin/experiences';
    } catch (err) {
      console.error('Failed to delete experience:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete experience');
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
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
        <Button onClick={fetchExperience}>Retry</Button>
      </div>
    );
  }

  if (!experience) {
    return (
      <div className="p-6 bg-dark-card border border-dark-border rounded-lg text-center">
        <p className="text-text-secondary">Experience not found</p>
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
              <h2 className="text-2xl font-bold text-text-primary">{experience.title}</h2>
              {experience.featured && <Badge variant="primary">Featured</Badge>}
            </div>
            <p className="text-lg text-accent-blue">{experience.company}</p>
            <p className="text-text-muted">
              {experience.location} | {formatDate(experience.startDate)} - {experience.endDate ? formatDate(experience.endDate) : 'Present'}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => window.location.href = `/admin/experiences/${experienceId}/edit`}
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

        {/* Summary */}
        {experience.summary && (
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-3">Summary</h3>
              <p className="text-text-secondary">{experience.summary}</p>
            </div>
          </Card>
        )}

        {/* Role Types */}
        {experience.roleTypes && experience.roleTypes.length > 0 && (
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-3">Role Types</h3>
              <div className="flex flex-wrap gap-2">
                {experience.roleTypes.map((role) => (
                  <Badge key={role}>{role.replace(/_/g, ' ')}</Badge>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* Responsibilities */}
        {experience.responsibilities && experience.responsibilities.length > 0 && (
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-3">Responsibilities</h3>
              <ul className="space-y-2">
                {experience.responsibilities.map((resp, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-accent-blue mt-1">•</span>
                    <span className="text-text-secondary">{resp}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        )}

        {/* Achievements */}
        {experience.achievements && experience.achievements.length > 0 && (
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-3">Achievements</h3>
              <ul className="space-y-3">
                {experience.achievements.map((achievement, index) => (
                  <li key={index} className="p-3 bg-dark-layer rounded-lg">
                    <p className="text-text-secondary">{achievement.description}</p>
                    {achievement.metrics && (
                      <p className="text-sm text-accent-green mt-1">Metrics: {achievement.metrics}</p>
                    )}
                    {achievement.impact && (
                      <p className="text-sm text-accent-amber mt-1">Impact: {achievement.impact}</p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        )}

        {/* Technologies */}
        {experience.technologies && experience.technologies.length > 0 && (
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-3">Technologies</h3>
              <div className="flex flex-wrap gap-2">
                {experience.technologies.map((tech) => (
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
      </div>

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Experience"
        message="Are you sure you want to delete this experience? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        isLoading={isDeleting}
      />
    </>
  );
}
