import { useState, useEffect } from 'react';
import { getGraphQLClient } from '../../../lib/graphql-client';
import { SKILL_QUERY, DELETE_SKILL_MUTATION } from '../../../lib/graphql/queries';
import type { Skill } from '../../../lib/types';
import { Button, Card, Badge, LevelBadge } from '../ui';
import { ConfirmModal } from '../ui/Modal';

interface SkillDetailPageProps {
  skillId: string;
}

interface SkillResponse {
  skill: Skill | null;
}

export default function SkillDetailPage({ skillId }: SkillDetailPageProps) {
  const [skill, setSkill] = useState<Skill | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchSkill();
  }, [skillId]);

  const fetchSkill = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const client = getGraphQLClient();
      const data = await client.request<SkillResponse>(SKILL_QUERY, { id: skillId });
      setSkill(data.skill);
    } catch (err) {
      console.error('Failed to fetch skill:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch skill');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const client = getGraphQLClient();
      await client.request(DELETE_SKILL_MUTATION, { id: skillId });
      window.location.href = '/admin/skills';
    } catch (err) {
      console.error('Failed to delete skill:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete skill');
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-text-secondary">Loading skill...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-900/20 border border-red-500/50 rounded-lg text-center">
        <p className="text-red-400 mb-4">{error}</p>
        <Button onClick={fetchSkill}>Retry</Button>
      </div>
    );
  }

  if (!skill) {
    return (
      <div className="p-6 bg-dark-card border border-dark-border rounded-lg text-center">
        <p className="text-text-secondary">Skill not found</p>
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
              <h2 className="text-2xl font-bold text-text-primary">{skill.name}</h2>
              <LevelBadge level={skill.level} />
              {skill.featured && <Badge variant="primary">Featured</Badge>}
            </div>
            <div className="flex items-center gap-4 text-text-muted">
              <span>Rating: {skill.rating}/5</span>
              <span>{skill.yearsOfExperience} years experience</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => window.location.href = `/admin/skills/${skillId}/edit`}
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

        {/* Role Relevance */}
        {skill.roleRelevance && skill.roleRelevance.length > 0 && (
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-3">Role Relevance</h3>
              <div className="flex flex-wrap gap-2">
                {skill.roleRelevance.map((role) => (
                  <Badge key={role}>{role.replace(/_/g, ' ')}</Badge>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* Tags */}
        {skill.tags && skill.tags.length > 0 && (
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {skill.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-dark-hover text-text-secondary rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* Keywords */}
        {skill.keywords && skill.keywords.length > 0 && (
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-3">Keywords</h3>
              <div className="flex flex-wrap gap-2">
                {skill.keywords.map((keyword) => (
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

        {/* Metadata */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-3">Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {skill.iconName && (
                <div>
                  <span className="text-text-muted">Icon:</span>
                  <span className="ml-2 text-text-primary">{skill.iconName}</span>
                </div>
              )}
              <div>
                <span className="text-text-muted">Created:</span>
                <span className="ml-2 text-text-primary">
                  {new Date(skill.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="text-text-muted">Updated:</span>
                <span className="ml-2 text-text-primary">
                  {new Date(skill.updatedAt).toLocaleDateString()}
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
        title="Delete Skill"
        message="Are you sure you want to delete this skill? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        isLoading={isDeleting}
      />
    </>
  );
}
