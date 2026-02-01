import { useState } from "react";
import { useForm } from "react-hook-form";
import type { Experience, Achievement } from "../../../lib/types";
import {
  GROUPED_ORGANIZATION_OPTIONS,
  stringsToOptions,
  optionsToStrings,
  type SelectOption,
} from "../../../lib/constants";
import { Button, Input, Textarea, Select, Card, CardHeader } from "../ui";
import Tag from "../ui/Tag";
import AIChatPanel from "../ai/AIChatPanel";

interface ExperienceFormProps {
  initialData?: Experience;
  onSubmit: (data: Partial<Experience>) => Promise<void>;
  onCancel: () => void;
}

const ROLE_TYPE_OPTIONS = [
  { value: "software_engineer", label: "Software Engineer" },
  { value: "engineering_manager", label: "Engineering Manager" },
  { value: "technical_writer", label: "Technical Writer" },
  { value: "technical_writing_manager", label: "Technical Writing Manager" },
];

export default function ExperienceForm({
  initialData,
  onSubmit,
  onCancel,
}: ExperienceFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [technologies, setTechnologies] = useState<string[]>(
    initialData?.technologies || []
  );
  const [newTech, setNewTech] = useState("");
  const [responsibilities, setResponsibilities] = useState<string[]>(
    initialData?.responsibilities || []
  );
  const [newResp, setNewResp] = useState("");
  const [achievements, setAchievements] = useState<Achievement[]>(
    initialData?.achievements || []
  );
  const [newAchievement, setNewAchievement] = useState("");
  const [roleTypes, setRoleTypes] = useState<string[]>(
    initialData?.roleTypes || []
  );
  const [organizations, setOrganizations] = useState<string[]>(
    initialData?.organizations || []
  );
  const [crossFunctional, setCrossFunctional] = useState<string[]>(
    initialData?.crossFunctional || []
  );
  const [showAIPanel, setShowAIPanel] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      company: initialData?.company || "",
      location: initialData?.location || "",
      title: initialData?.title || "",
      industry: initialData?.industry || "",
      summary: initialData?.summary || "",
      startDate: initialData?.startDate
        ? new Date(initialData.startDate).toISOString().split("T")[0]
        : "",
      endDate: initialData?.endDate
        ? new Date(initialData.endDate).toISOString().split("T")[0]
        : "",
      featured: initialData?.featured || false,
      displayOrder: initialData?.displayOrder ?? 0,
    },
  });

  const onFormSubmit = async (data: any) => {
    setError("");
    setIsSubmitting(true);

    try {
      const experienceData: Partial<Experience> = {
        company: data.company,
        location: data.location,
        title: data.title,
        industry: data.industry || undefined,
        summary: data.summary || undefined,
        startDate: data.startDate,
        endDate: data.endDate || undefined,
        roleTypes,
        responsibilities,
        achievements,
        technologies,
        organizations,
        crossFunctional,
        displayOrder: parseInt(data.displayOrder) || 0,
        featured: data.featured,
      };

      await onSubmit(experienceData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save experience");
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

  const addResponsibility = () => {
    if (newResp.trim()) {
      setResponsibilities([...responsibilities, newResp.trim()]);
      setNewResp("");
    }
  };

  const removeResponsibility = (index: number) => {
    setResponsibilities(responsibilities.filter((_, i) => i !== index));
  };

  const addAchievement = () => {
    if (newAchievement.trim()) {
      setAchievements([
        ...achievements,
        { description: newAchievement.trim(), keywords: [] },
      ]);
      setNewAchievement("");
    }
  };

  const removeAchievement = (index: number) => {
    setAchievements(achievements.filter((_, i) => i !== index));
  };

  const toggleRoleType = (roleType: string) => {
    setRoleTypes((prev) =>
      prev.includes(roleType)
        ? prev.filter((r) => r !== roleType)
        : [...prev, roleType]
    );
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
              label="Company"
              {...register("company", { required: "Company is required" })}
              placeholder="e.g., Acme Corp"
              error={errors.company?.message}
            />

            <Input
              label="Job Title"
              {...register("title", { required: "Title is required" })}
              placeholder="e.g., Senior Software Engineer"
              error={errors.title?.message}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Location"
              {...register("location", { required: "Location is required" })}
              placeholder="e.g., San Francisco, CA"
              error={errors.location?.message}
            />

            <Input
              label="Industry"
              {...register("industry")}
              placeholder="e.g., Technology, Finance"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Start Date"
              type="date"
              {...register("startDate", { required: "Start date is required" })}
              error={errors.startDate?.message}
            />

            <Input
              label="End Date"
              type="date"
              {...register("endDate")}
              helperText="Leave empty if current position"
            />
          </div>

          <Textarea
            label="Summary"
            {...register("summary")}
            placeholder="Brief overview of your role..."
            rows={3}
          />
        </div>
      </Card>

      {/* Role Types */}
      <Card>
        <CardHeader
          title="Role Types"
          description="Select which career tracks this experience applies to"
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
          description="Technologies, tools, and frameworks used"
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

      {/* Responsibilities */}
      <Card>
        <CardHeader
          title="Responsibilities"
          description="Key responsibilities and duties"
        />

        <div className="flex gap-2 mb-4">
          <Textarea
            value={newResp}
            onChange={(e) => setNewResp(e.target.value)}
            placeholder="Add a responsibility..."
            rows={2}
            className="flex-1"
          />
          <Button type="button" variant="secondary" onClick={addResponsibility}>
            Add
          </Button>
        </div>

        {responsibilities.length > 0 && (
          <ul className="space-y-2">
            {responsibilities.map((resp, index) => (
              <li
                key={index}
                className="flex items-start gap-3 p-3 bg-dark-layer rounded-lg"
              >
                <span className="flex-1 text-text-primary">{resp}</span>
                <button
                  type="button"
                  onClick={() => removeResponsibility(index)}
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

      {/* Achievements */}
      <Card>
        <CardHeader
          title="Achievements"
          description="Notable accomplishments with measurable impact"
        />

        <div className="flex gap-2 mb-4">
          <Textarea
            value={newAchievement}
            onChange={(e) => setNewAchievement(e.target.value)}
            placeholder="Add an achievement..."
            rows={2}
            className="flex-1"
          />
          <Button type="button" variant="secondary" onClick={addAchievement}>
            Add
          </Button>
        </div>

        {achievements.length > 0 && (
          <ul className="space-y-2">
            {achievements.map((achievement, index) => (
              <li
                key={index}
                className="flex items-start gap-3 p-3 bg-dark-layer rounded-lg"
              >
                <span className="flex-1 text-text-primary">{achievement.description}</span>
                <button
                  type="button"
                  onClick={() => removeAchievement(index)}
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

        <div className="flex items-center gap-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              {...register("featured")}
              className="w-4 h-4 rounded border-dark-border bg-dark-layer text-accent-blue focus:ring-accent-blue focus:ring-offset-dark-base"
            />
            <span className="text-text-primary">Featured experience</span>
          </label>

          <div className="flex items-center gap-2">
            <label className="text-sm text-text-secondary">Display Order:</label>
            <input
              type="number"
              {...register("displayOrder")}
              className="w-20 px-3 py-2 bg-dark-layer border border-dark-border rounded-lg text-text-primary focus:outline-none focus:border-accent-blue"
            />
          </div>
        </div>
      </Card>

      {/* Form Actions */}
      <div className="flex justify-end gap-4 pt-4 border-t border-dark-border">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Experience"}
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
        contextData={{
          ...watch(),
          roleTypes,
          responsibilities,
          achievements,
          technologies,
          organizations,
          crossFunctional,
        }}
        contextLabel="Experience Form Data"
        collection="experiences"
        roleType={roleTypes[0] || "technical_writer"}
      />
    </form>
  );
}
