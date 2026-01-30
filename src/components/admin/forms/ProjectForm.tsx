import { useState } from "react";
import { useForm } from "react-hook-form";
import type { Project, ProjectLink } from "../../../lib/types";
import { Button, Input, Textarea, Select, Card, CardHeader } from "../ui";
import Tag from "../ui/Tag";

interface ProjectFormProps {
  initialData?: Project;
  onSubmit: (data: Partial<Project>) => Promise<void>;
  onCancel: () => void;
}

const PROJECT_TYPE_OPTIONS = [
  { value: "documentation", label: "Documentation" },
  { value: "web-application", label: "Web Application" },
  { value: "api", label: "API" },
  { value: "library", label: "Library/Package" },
  { value: "tool", label: "Tool/Utility" },
  { value: "open-source", label: "Open Source" },
  { value: "content-strategy", label: "Content Strategy" },
  { value: "developer-experience", label: "Developer Experience" },
];

const ROLE_TYPE_OPTIONS = [
  { value: "software_engineer", label: "Software Engineer" },
  { value: "engineering_manager", label: "Engineering Manager" },
  { value: "technical_writer", label: "Technical Writer" },
  { value: "technical_writing_manager", label: "Technical Writing Manager" },
];

const LINK_TYPE_OPTIONS = [
  { value: "github", label: "GitHub" },
  { value: "demo", label: "Live Demo" },
  { value: "docs", label: "Documentation" },
  { value: "article", label: "Article" },
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
  const [roleTypes, setRoleTypes] = useState<string[]>(
    initialData?.roleTypes || []
  );
  const [links, setLinks] = useState<ProjectLink[]>(initialData?.links || []);
  const [newLink, setNewLink] = useState<ProjectLink>({
    type: "github",
    url: "",
    linkText: "",
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: initialData?.name || "",
      type: initialData?.type || "",
      date: initialData?.date
        ? new Date(initialData.date).toISOString().split("T")[0]
        : "",
      overview: initialData?.overview || "",
      challenge: initialData?.challenge || "",
      approach: initialData?.approach || "",
      outcome: initialData?.outcome || "",
      impact: initialData?.impact || "",
      featured: initialData?.featured || false,
    },
  });

  const onFormSubmit = async (data: any) => {
    setError("");
    setIsSubmitting(true);

    try {
      const projectData: Partial<Project> = {
        name: data.name,
        type: data.type,
        date: data.date || undefined,
        overview: data.overview,
        challenge: data.challenge || undefined,
        approach: data.approach || undefined,
        outcome: data.outcome || undefined,
        impact: data.impact || undefined,
        technologies,
        keywords,
        roleTypes,
        links: links.filter((l) => l.url),
        featured: data.featured,
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

  const removeTechnology = (index: number) => {
    setTechnologies(technologies.filter((_, i) => i !== index));
  };

  const addKeyword = () => {
    if (newKeyword.trim() && !keywords.includes(newKeyword.trim())) {
      setKeywords([...keywords, newKeyword.trim()]);
      setNewKeyword("");
    }
  };

  const removeKeyword = (index: number) => {
    setKeywords(keywords.filter((_, i) => i !== index));
  };

  const toggleRoleType = (roleType: string) => {
    setRoleTypes((prev) =>
      prev.includes(roleType)
        ? prev.filter((r) => r !== roleType)
        : [...prev, roleType]
    );
  };

  const addLink = () => {
    if (newLink.url.trim()) {
      setLinks([...links, { ...newLink }]);
      setNewLink({ type: "github", url: "", linkText: "" });
    }
  };

  const removeLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
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
          title="Role Types"
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
                checked={roleTypes.includes(role.value)}
                onChange={() => toggleRoleType(role.value)}
                className="w-4 h-4 rounded border-dark-border bg-dark-layer text-accent-blue focus:ring-accent-blue focus:ring-offset-dark-base"
              />
              <span className="text-text-primary">{role.label}</span>
            </label>
          ))}
        </div>
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
            onKeyPress={(e) => {
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
              <Tag key={index} onRemove={() => removeTechnology(index)}>
                {tech}
              </Tag>
            ))}
          </div>
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
            onKeyPress={(e) => {
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
              <Tag key={index} onRemove={() => removeKeyword(index)}>
                {keyword}
              </Tag>
            ))}
          </div>
        )}
      </Card>

      {/* Links */}
      <Card>
        <CardHeader title="Project Links" description="Add links to demos, repos, or documentation" />

        <div className="flex flex-wrap gap-2 mb-4">
          <Select
            options={LINK_TYPE_OPTIONS}
            value={newLink.type}
            onChange={(e) => setNewLink({ ...newLink, type: e.target.value })}
            className="w-32"
          />
          <input
            type="url"
            value={newLink.url}
            onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
            placeholder="URL"
            className="flex-1 min-w-[200px] px-4 py-2 bg-dark-layer border border-dark-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-blue"
          />
          <input
            type="text"
            value={newLink.linkText || ""}
            onChange={(e) => setNewLink({ ...newLink, linkText: e.target.value })}
            placeholder="Link text (optional)"
            className="w-40 px-4 py-2 bg-dark-layer border border-dark-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-blue"
          />
          <Button type="button" variant="secondary" onClick={addLink}>
            Add
          </Button>
        </div>

        {links.length > 0 && (
          <ul className="space-y-2">
            {links.map((link, index) => (
              <li
                key={index}
                className="flex items-center gap-3 p-3 bg-dark-layer rounded-lg"
              >
                <span className="text-accent-blue font-medium capitalize">{link.type}</span>
                <span className="flex-1 text-text-primary truncate">{link.url}</span>
                {link.linkText && (
                  <span className="text-text-muted">({link.linkText})</span>
                )}
                <button
                  type="button"
                  onClick={() => removeLink(index)}
                  className="text-text-muted hover:text-red-400 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        )}
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
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Project"}
        </Button>
      </div>
    </form>
  );
}
