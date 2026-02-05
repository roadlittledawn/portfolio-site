import { useState } from "react";
import type { Skill } from "../../../lib/types";
import { Button, Card, Badge, LevelBadge } from "../ui";
import { ConfirmModal } from "../ui/Modal";

interface SkillsListProps {
  skills: Skill[];
  onEdit: (skill: Skill) => void;
  onDelete: (id: string) => Promise<void>;
  isLoading?: boolean;
}

export default function SkillsList({
  skills,
  onEdit,
  onDelete,
  isLoading,
}: SkillsListProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await onDelete(deleteId);
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-text-secondary">Loading skills...</div>
      </div>
    );
  }

  if (skills.length === 0) {
    return (
      <Card padding="lg" className="text-center">
        <p className="text-text-secondary mb-4">No skills found</p>
        <Button onClick={() => (window.location.href = "/admin/skills/new")}>
          Add First Skill
        </Button>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {skills.map((skill) => (
          <div
            key={skill.id}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-dark-card border border-dark-border rounded-lg hover:border-dark-hover transition-colors"
          >
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h3 className="font-medium text-text-primary">{skill.name}</h3>
                <LevelBadge level={skill.level} />
                {skill.featured && <Badge variant="primary">Featured</Badge>}
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm text-text-muted">
                <span>Rating: {skill.rating}/5</span>
                <span>{skill.yearsOfExperience} years</span>
                {skill.tags && skill.tags.length > 0 && (
                  <span className="truncate max-w-xs">
                    Tags: {skill.tags.slice(0, 3).join(", ")}
                    {skill.tags.length > 3 && "..."}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 sm:flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => (window.location.href = `/admin/skills/${skill.id}`)}
              >
                View
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onEdit(skill)}>
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDeleteId(skill.id)}
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
        title="Delete Skill"
        message="Are you sure you want to delete this skill? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        isLoading={isDeleting}
      />
    </>
  );
}
