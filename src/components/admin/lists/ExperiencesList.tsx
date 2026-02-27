import { useState } from "react";
import type { Experience } from "../../../lib/types";
import { Button, Card, Badge } from "../ui";
import { ConfirmModal } from "../ui/Modal";

interface ExperiencesListProps {
  experiences: Experience[];
  onEdit: (experience: Experience) => void;
  onDelete: (id: string) => Promise<void>;
  isLoading?: boolean;
}

export default function ExperiencesList({
  experiences,
  onEdit,
  onDelete,
  isLoading,
}: ExperiencesListProps) {
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-text-secondary">Loading experiences...</div>
      </div>
    );
  }

  if (experiences.length === 0) {
    return (
      <Card padding="lg" className="text-center">
        <p className="text-text-secondary mb-4">No experiences found</p>
        <Button onClick={() => (window.location.href = "/admin/experiences/new")}>
          Add First Experience
        </Button>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {experiences.map((exp) => (
          <div
            key={exp.id}
            className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 p-4 bg-dark-card border border-dark-border rounded-lg hover:border-dark-hover transition-colors"
          >
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h3 className="font-medium text-text-primary">{exp.title}</h3>
                <span className="text-text-muted">at</span>
                <span className="text-accent-blue">{exp.company}</span>
                {exp.featured && <Badge variant="primary">Featured</Badge>}
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm text-text-muted">
                <span>
                  {formatDate(exp.startDate)} - {exp.endDate ? formatDate(exp.endDate) : "Present"}
                </span>
                <span>{exp.location}</span>
                {exp.roleTypes && exp.roleTypes.length > 0 && (
                  <span className="truncate max-w-xs">
                    {exp.roleTypes.map((rt) => rt.replace(/_/g, " ")).join(", ")}
                  </span>
                )}
              </div>
              {exp.technologies && exp.technologies.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {exp.technologies.slice(0, 5).map((tech) => (
                    <span
                      key={tech}
                      className="px-2 py-0.5 text-xs bg-dark-hover text-text-secondary rounded"
                    >
                      {tech}
                    </span>
                  ))}
                  {exp.technologies.length > 5 && (
                    <span className="px-2 py-0.5 text-xs text-text-muted">
                      +{exp.technologies.length - 5} more
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 sm:flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => (window.location.href = `/admin/experiences/${exp.id}`)}
              >
                View
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onEdit(exp)}>
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDeleteId(exp.id)}
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
        title="Delete Experience"
        message="Are you sure you want to delete this experience? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        isLoading={isDeleting}
      />
    </>
  );
}
