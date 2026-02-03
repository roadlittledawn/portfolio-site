import { useState } from "react";
import { useForm } from "react-hook-form";
import type { Project, ProjectLink, ProjectType, RoleType } from "../../../lib/types";
import { Button, Input, Textarea, Select, Card, CardHeader } from "../ui";
import Tag from "../ui/Tag";
import AIChatPanel from "../ai/AIChatPanel";

interface ProjectFormProps {
  initialData?: Project;
  onSubmit: (data: Partial<Project>) => Promise<void>;
  onCancel: () => void;
}

const PROJECT_TYPE_OPTIONS = [
  { value: "technical_writing", label: "Technical Writing" },
  { value: "software_engineering", label: "Software Engineering" },
  { value: "leadership", label: "Leadership" },
  { value: "hybrid", label: "Hybrid" },
];

const ROLE_TYPE_OPTIONS = [
  { value: "technical_writer", label: "Technical Writer" },
  { value: "technical_writing_manager", label: "Technical Writing Manager" },
  { value: "software_engineer", label: "Software Engineer" },
  { value: "engineering_manager", label: "Engineering Manager" },
];

const LINK_TYPE_OPTIONS = [
  { value: "github", label: "GitHub" },
  { value: "demo", label: "Demo/Live Site" },
  { value: "writing_sample", label: "Writing Sample" },
  { value: "other", label: "Other" },
];

export default function ProjectForm({
  initialData,
  onSubmit,
  onCancel,
}: ProjectFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [technologies, setTechnologies] = useState<string[]>(
    initialData?.technologies || []
  );
  const [newTech, setNewTech] = useState("");
  const [keywords, setKeywords] = useState<string[]>(
    initialData?.keywords || []
  );
  const [newKeyword, setNewKeyword] = useState("");
  const [links, setLinks] = useState<ProjectLink[]>(initialData?.links || []);
  const [showAIPanel, setShowAIPanel] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: initialData?.name || "",
      type: initialData?.type || "technical_writing",
      date: initialData?.date
        ? new Date(initialData.date).toISOString().split("T")[0]
        : "",
      featured: initialData?.featured || false,
      overview: initialData?.overview || "",
      challenge: initialData?.challenge || "",
      approach: initialData?.approach || "",
      outcome: initialData?.outcome || "",
      impact: initialData?.impact || "",
      roleTypes: initialData?.roleTypes || [],
    },
  });

  const onFormSubmit = async (data: any) => {
    setError("");
    setIsSubmitting(true);

    try {
      const projectData: Partial<Project> = {
        name: data.name,
        type: data.type as ProjectType,
        date: data.date || undefined,
        featured: data.featured,
        overview: data.overview,
        challenge: data.challenge || undefined,
        approach: data.approach || undefined,
        outcome: data.outcome || undefined,
        impact: data.impact || undefined,
        technologies,
        keywords,
        links,
        roleTypes: data.roleTypes,
      };

      await onSubmit(projectData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save project");
      setIsSubmitting(false);
    }
  };

  const addTechnology = () => {
    if (newTech.trim() && !technologies.includes(newTech.trim())) {
      setTechnologies([...technologies, newTech.trim()]);
      setNewTech("");
    }
  };

  const removeTechnology = (tech: string) => {
    setTechnologies(technologies.filter((t) => t !== tech));
  };

  const addKeyword = () => {
    if (newKeyword.trim() && !keywords.includes(newKeyword.trim())) {
      setKeywords([...keywords, newKeyword.trim()]);
      setNewKeyword("");
    }
  };

  const removeKeyword = (keyword: string) => {
    setKeywords(keywords.filter((k) => k !== keyword));
  };

  const addLink = () => {
    setLinks([...links, { url: "", linkText: "", type: "github" }]);
  };

  const updateLink = (index: number, field: string, value: string) => {
    const updated = [...links];
    updated[index] = { ...updated[index], [field]: value };
    setLinks(updated);
  };

  const removeLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  const getCurrentProjectData = () => {
    const formData = watch();
    return {
      ...formData,
      technologies,
      keywords,
      links,
    };
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8">
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Basic Information */}
      <Card>
        <CardHeader title="Basic Information" />

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Project Name"
              {...register("name", { required: "Project name is required" })}
              placeholder="e.g., API Documentation Overhaul"
              error={errors.name?.message}
            />

            <Select
              label="Project Type"
              options={PROJECT_TYPE_OPTIONS}
              placeholder="Select type..."
              {...register("type", { required: "Project type is required" })}
              error={errors.type?.message}
            />
          </div>

          <Input
            label="Date"
            type="date"
            {...register("date")}
            helperText="When the project was completed"
          />

          <Textarea
            label="Overview"
            {...register("overview", { required: "Overview is required" })}
            placeholder="Brief description of the project..."
            rows={3}
            error={errors.overview?.message}
          />
        </div>
      </Card>

      {/* Project Details */}
      <Card>
        <CardHeader
          title="Project Details"
          description="Describe the challenge, approach, outcome, and impact"
        />

        <div className="space-y-6">
          <Textarea
            label="Challenge"
            {...register("challenge")}
            placeholder="What problem did this project solve?"
            rows={3}
          />

          <Textarea
            label="Approach"
            {...register("approach")}
            placeholder="How did you approach the problem?"
            rows={3}
          />

          <Textarea
            label="Outcome"
            {...register("outcome")}
            placeholder="What was the result?"
            rows={3}
          />

          <Textarea
            label="Impact"
            {...register("impact")}
            placeholder="What measurable impact did it have?"
            rows={3}
          />
        </div>
      </Card>

      {/* Role Types */}
      <Card>
        <CardHeader
          title="Relevant Role Types"
          description="Which career tracks does this project showcase?"
        />

        <div className="flex flex-wrap gap-4">
          {ROLE_TYPE_OPTIONS.map((role) => (
            <label
              key={role.value}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="checkbox"
                value={role.value}
                {...register("roleTypes", {
                  required: "Select at least one role type",
                })}
                disabled={isSubmitting}
                className="w-4 h-4 rounded border-dark-border bg-dark-layer text-accent-blue focus:ring-accent-blue focus:ring-offset-dark-base"
              />
              <span className="text-text-primary">{role.label}</span>
            </label>
          ))}
        </div>
        {errors.roleTypes && (
          <span className="text-red-400 text-sm mt-2 block">
            {errors.roleTypes.message}
          </span>
        )}
      </Card>

      {/* Technologies */}
      <Card>
        <CardHeader
          title="Technologies"
          description="Technologies and tools used"
        />

        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newTech}
            onChange={(e) => setNewTech(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTechnology();
              }
            }}
            placeholder="Add a technology..."
            className="flex-1 px-4 py-2 bg-dark-layer border border-dark-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-blue"
          />
          <Button type="button" variant="secondary" onClick={addTechnology}>
            Add
          </Button>
        </div>

        {technologies.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {technologies.map((tech, index) => (
              <Tag key={index} onRemove={() => removeTechnology(tech)}>
                {tech}
              </Tag>
            ))}
          </div>
        )}
        {technologies.length === 0 && (
          <span className="text-red-400 text-sm">
            At least one technology is required
          </span>
        )}
      </Card>

      {/* Keywords */}
      <Card>
        <CardHeader title="Keywords" description="Keywords for search and filtering" />

        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newKeyword}
            onChange={(e) => setNewKeyword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addKeyword();
              }
            }}
            placeholder="Add a keyword..."
            className="flex-1 px-4 py-2 bg-dark-layer border border-dark-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-blue"
          />
          <Button type="button" variant="secondary" onClick={addKeyword}>
            Add
          </Button>
        </div>

        {keywords.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {keywords.map((keyword, index) => (
              <Tag key={index} onRemove={() => removeKeyword(keyword)}>
                {keyword}
              </Tag>
            ))}
          </div>
        )}
      </Card>

      {/* Links */}
      <Card>
        <CardHeader title="Project Links (Optional)" />

        <Button
          type="button"
          variant="secondary"
          onClick={addLink}
          disabled={isSubmitting}
          className="mb-4"
        >
          + Add Link
        </Button>

        {links.map((link, idx) => (
          <div
            key={idx}
            className="p-4 mb-4 bg-dark-layer border border-dark-border rounded-lg space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Type
                </label>
                <select
                  value={link.type}
                  onChange={(e) => updateLink(idx, "type", e.target.value)}
                  disabled={isSubmitting}
                  className="w-full px-4 py-2 bg-dark-card border border-dark-border rounded-lg text-text-primary focus:outline-none focus:border-accent-blue"
                >
                  {LINK_TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  URL
                </label>
                <input
                  type="url"
                  value={link.url}
                  onChange={(e) => updateLink(idx, "url", e.target.value)}
                  placeholder="https://..."
                  disabled={isSubmitting}
                  className="w-full px-4 py-2 bg-dark-card border border-dark-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-blue"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Link Text
              </label>
              <input
                type="text"
                value={link.linkText || ""}
                onChange={(e) => updateLink(idx, "linkText", e.target.value)}
                placeholder="e.g., View on GitHub, Read the docs"
                disabled={isSubmitting}
                className="w-full px-4 py-2 bg-dark-card border border-dark-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-blue"
              />
            </div>

            <Button
              type="button"
              variant="ghost"
              onClick={() => removeLink(idx)}
              disabled={isSubmitting}
              className="text-red-400 hover:text-red-300"
            >
              Remove Link
            </Button>
          </div>
        ))}
      </Card>

      {/* Display Options */}
      <Card>
        <CardHeader title="Display Options" />

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            {...register("featured")}
            className="w-4 h-4 rounded border-dark-border bg-dark-layer text-accent-blue focus:ring-accent-blue focus:ring-offset-dark-base"
          />
          <span className="text-text-primary">Featured project</span>
        </label>
      </Card>

      {/* Form Actions */}
      <div className="flex justify-end gap-4 pt-4 border-t border-dark-border">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          isLoading={isSubmitting}
          disabled={isSubmitting || technologies.length === 0}
        >
          {isSubmitting
            ? "Saving..."
            : initialData
            ? "Update Project"
            : "Create Project"}
        </Button>
      </div>

      {/* Floating AI Assistant Button */}
      <button
        type="button"
        onClick={() => setShowAIPanel(true)}
        className="fixed bottom-6 right-6 flex items-center gap-2 px-4 py-3 bg-accent-blue hover:bg-accent-blue/80 text-white font-medium rounded-full shadow-lg transition-colors z-40"
        disabled={isSubmitting}
        title="Open AI Writing Assistant"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        Ask AI
      </button>

      {/* AI Chat Panel */}
      <AIChatPanel
        isOpen={showAIPanel}
        onClose={() => setShowAIPanel(false)}
        contextData={getCurrentProjectData()}
        contextLabel="Project Form Data"
      />
    </form>
  );
}
