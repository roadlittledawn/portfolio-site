import { useState } from "react";
import type { Project } from "../../../lib/types";
import { Button, Card, Badge } from "../ui";
import { ConfirmModal } from "../ui/Modal";

interface ProjectsListProps {
  projects: Project[];
  onEdit: (project: Project) => void;
  onDelete: (id: string) => Promise<void>;
  isLoading?: boolean;
}

export default function ProjectsList({
  projects,
  onEdit,
  onDelete,
  isLoading,
}: ProjectsListProps) {
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
        <div className="text-text-secondary">Loading projects...</div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <Card padding="lg" className="text-center">
        <p className="text-text-secondary mb-4">No projects found</p>
        <Button onClick={() => (window.location.href = "/admin/projects/new")}>
          Add First Project
        </Button>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {projects.map((project) => (
          <div
            key={project.id}
            className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 p-4 bg-dark-card border border-dark-border rounded-lg hover:border-dark-hover transition-colors"
          >
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h3 className="font-medium text-text-primary">{project.name}</h3>
                <Badge>{project.type}</Badge>
                {project.featured && <Badge variant="primary">Featured</Badge>}
              </div>
              <p className="text-sm text-text-muted mt-1 line-clamp-2">
                {project.overview}
              </p>
              {project.technologies && project.technologies.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {project.technologies.slice(0, 5).map((tech) => (
                    <span
                      key={tech}
                      className="px-2 py-0.5 text-xs bg-dark-hover text-text-secondary rounded"
                    >
                      {tech}
                    </span>
                  ))}
                  {project.technologies.length > 5 && (
                    <span className="px-2 py-0.5 text-xs text-text-muted">
                      +{project.technologies.length - 5} more
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 sm:flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => (window.location.href = `/admin/projects/${project.id}`)}
              >
                View
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onEdit(project)}>
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDeleteId(project.id)}
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
        title="Delete Project"
        message="Are you sure you want to delete this project? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        isLoading={isDeleting}
      />
    </>
  );
}
