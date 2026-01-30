import { useState } from "react";
import { useForm } from "react-hook-form";
import type { Skill } from "../../../lib/types";
import { Button, Input, Select, Card, CardHeader } from "../ui";
import Tag from "../ui/Tag";

interface SkillsFormProps {
  initialData?: Skill;
  onSubmit: (data: Partial<Skill>) => Promise<void>;
  onCancel: () => void;
}

const SKILL_LEVELS = [
  { value: "Beginner", label: "Beginner" },
  { value: "Intermediate", label: "Intermediate" },
  { value: "Advanced", label: "Advanced" },
  { value: "Expert", label: "Expert" },
];

const ROLE_RELEVANCE_OPTIONS = [
  { value: "engineering", label: "Engineering" },
  { value: "technical_writing", label: "Technical Writing" },
  { value: "management", label: "Management" },
  { value: "design", label: "Design" },
];

export default function SkillsForm({
  initialData,
  onSubmit,
  onCancel,
}: SkillsFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [newTag, setNewTag] = useState("");
  const [keywords, setKeywords] = useState<string[]>(initialData?.keywords || []);
  const [newKeyword, setNewKeyword] = useState("");
  const [roleRelevance, setRoleRelevance] = useState<string[]>(initialData?.roleRelevance || []);
  const [featured, setFeatured] = useState<boolean>(initialData?.featured || false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: initialData?.name || "",
      level: initialData?.level || "",
      rating: initialData?.rating || 3,
      yearsOfExperience: initialData?.yearsOfExperience || 0,
      iconName: initialData?.iconName || "",
    },
  });

  const onFormSubmit = async (data: any) => {
    setError("");
    setIsSubmitting(true);

    try {
      const skillData: Partial<Skill> = {
        name: data.name,
        roleRelevance: roleRelevance,
        level: data.level,
        rating: parseInt(data.rating),
        yearsOfExperience: parseInt(data.yearsOfExperience) || 0,
        tags: tags,
        iconName: data.iconName || undefined,
        keywords: keywords,
        featured: featured,
      };

      await onSubmit(skillData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save skill");
      setIsSubmitting(false);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
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

  const toggleRole = (roleValue: string) => {
    setRoleRelevance((prev) =>
      prev.includes(roleValue)
        ? prev.filter((r) => r !== roleValue)
        : [...prev, roleValue]
    );
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8">
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Basic Information Section */}
      <Card>
        <CardHeader title="Basic Information" />

        <div className="space-y-6">
          <Input
            label="Skill Name"
            {...register("name", { required: "Skill name is required" })}
            placeholder="e.g., React.js, Python, Technical Writing"
            error={errors.name?.message}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select
              label="Proficiency Level"
              options={SKILL_LEVELS}
              placeholder="Select level..."
              {...register("level", { required: "Level is required" })}
              error={errors.level?.message}
            />

            <Input
              label="Rating (1-5)"
              type="number"
              min={1}
              max={5}
              step={1}
              {...register("rating", {
                required: "Rating is required",
                min: { value: 1, message: "Rating must be at least 1" },
                max: { value: 5, message: "Rating cannot exceed 5" },
              })}
              error={errors.rating?.message}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Years of Experience"
              type="number"
              min={0}
              step={0.5}
              {...register("yearsOfExperience", {
                required: "Years of experience is required",
                min: { value: 0, message: "Cannot be negative" },
              })}
              placeholder="e.g., 3.5"
              error={errors.yearsOfExperience?.message}
            />

            <Input
              label="Icon Name"
              {...register("iconName")}
              placeholder="e.g., React, Python (optional)"
              helperText="Icon identifier for display purposes"
            />
          </div>
        </div>
      </Card>

      {/* Role Relevance Section */}
      <Card>
        <CardHeader
          title="Role Relevance"
          description="Select which roles this skill is relevant for"
        />

        <div className="flex flex-wrap gap-4">
          {ROLE_RELEVANCE_OPTIONS.map((role) => (
            <label
              key={role.value}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={roleRelevance.includes(role.value)}
                onChange={() => toggleRole(role.value)}
                className="w-4 h-4 rounded border-dark-border bg-dark-layer text-accent-blue focus:ring-accent-blue focus:ring-offset-dark-base"
              />
              <span className="text-text-primary">{role.label}</span>
            </label>
          ))}
        </div>
      </Card>

      {/* Featured Section */}
      <Card>
        <CardHeader
          title="Featured Skill"
          description="Featured skills appear on role-specific home pages and represent your strongest skills"
        />

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={featured}
            onChange={(e) => setFeatured(e.target.checked)}
            className="w-4 h-4 rounded border-dark-border bg-dark-layer text-accent-blue focus:ring-accent-blue focus:ring-offset-dark-base"
          />
          <span className="text-text-primary">Mark as featured skill</span>
        </label>
      </Card>

      {/* Tags Section */}
      <Card>
        <CardHeader
          title="Tags"
          description="Add tags to categorize this skill (e.g., frontend, backend, library)"
        />

        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTag();
              }
            }}
            placeholder="Add a tag..."
            className="flex-1 px-4 py-2 bg-dark-layer border border-dark-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-blue"
          />
          <Button type="button" variant="secondary" onClick={addTag}>
            Add
          </Button>
        </div>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <Tag key={index} onRemove={() => removeTag(index)}>
                {tag}
              </Tag>
            ))}
          </div>
        )}
      </Card>

      {/* Keywords Section */}
      <Card>
        <CardHeader
          title="Keywords"
          description="Add keywords for search and filtering"
        />

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

      {/* Form Actions */}
      <div className="flex justify-end gap-4 pt-4 border-t border-dark-border">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Skill"}
        </Button>
      </div>
    </form>
  );
}
