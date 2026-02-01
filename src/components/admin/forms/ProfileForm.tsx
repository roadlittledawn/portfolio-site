import { useState } from "react";
import { useForm } from "react-hook-form";
import type { Profile } from "../../../lib/types";
import { Button, Input, Textarea, Card, CardHeader } from "../ui";
import AIChatPanel from "../ai/AIChatPanel";

interface ProfileFormProps {
  initialData?: Profile;
  onSubmit: (data: Partial<Profile>) => Promise<void>;
  onCancel: () => void;
}

const ROLE_TYPES = [
  { value: "technical_writer", label: "Technical Writer" },
  { value: "technical_writing_manager", label: "Technical Writing Manager" },
  { value: "software_engineer", label: "Software Engineer" },
  { value: "engineering_manager", label: "Engineering Manager" },
];

export default function ProfileForm({
  initialData,
  onSubmit,
  onCancel,
}: ProfileFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [valuePropositions, setValuePropositions] = useState<string[]>(
    initialData?.valuePropositions || []
  );
  const [newValueProp, setNewValueProp] = useState("");
  const [uniqueSellingPoints, setUniqueSellingPoints] = useState<string[]>(
    initialData?.uniqueSellingPoints || []
  );
  const [newUSP, setNewUSP] = useState("");
  const [byRolePositioning, setByRolePositioning] = useState<Record<string, string>>(
    initialData?.positioning?.byRole || {}
  );
  const [showAIPanel, setShowAIPanel] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: initialData?.personalInfo?.name || "",
      email: initialData?.personalInfo?.email || "",
      phone: initialData?.personalInfo?.phone || "",
      location: initialData?.personalInfo?.location || "",
      portfolio: initialData?.personalInfo?.links?.portfolio || "",
      github: initialData?.personalInfo?.links?.github || "",
      linkedin: initialData?.personalInfo?.links?.linkedin || "",
      writingSamples: initialData?.personalInfo?.links?.writingSamples || "",
      currentPositioning: initialData?.positioning?.current || "",
      professionalMission: initialData?.professionalMission || "",
    },
  });

  const onFormSubmit = async (data: any) => {
    setError("");
    setIsSubmitting(true);

    try {
      const profileData: Partial<Profile> = {
        personalInfo: {
          name: data.name,
          email: data.email,
          phone: data.phone || undefined,
          location: data.location || undefined,
          links: {
            portfolio: data.portfolio || undefined,
            github: data.github || undefined,
            linkedin: data.linkedin || undefined,
            writingSamples: data.writingSamples || undefined,
          },
        },
        positioning: {
          current: data.currentPositioning,
          byRole: byRolePositioning,
        },
        valuePropositions,
        professionalMission: data.professionalMission || "",
        uniqueSellingPoints,
      };

      await onSubmit(profileData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save profile");
      setIsSubmitting(false);
    }
  };

  const addValueProposition = () => {
    if (newValueProp.trim()) {
      setValuePropositions([...valuePropositions, newValueProp.trim()]);
      setNewValueProp("");
    }
  };

  const removeValueProposition = (index: number) => {
    setValuePropositions(valuePropositions.filter((_, i) => i !== index));
  };

  const addUniqueSellingPoint = () => {
    if (newUSP.trim()) {
      setUniqueSellingPoints([...uniqueSellingPoints, newUSP.trim()]);
      setNewUSP("");
    }
  };

  const removeUniqueSellingPoint = (index: number) => {
    setUniqueSellingPoints(uniqueSellingPoints.filter((_, i) => i !== index));
  };

  const updateRolePositioning = (roleType: string, value: string) => {
    setByRolePositioning({
      ...byRolePositioning,
      [roleType]: value,
    });
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8">
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Personal Information */}
      <Card>
        <CardHeader title="Personal Information" />

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Full Name"
              {...register("name", { required: "Name is required" })}
              error={errors.name?.message}
            />

            <Input
              label="Email"
              type="email"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address",
                },
              })}
              error={errors.email?.message}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Phone"
              type="tel"
              {...register("phone")}
            />

            <Input
              label="Location"
              {...register("location")}
              placeholder="e.g., San Francisco, CA"
            />
          </div>
        </div>
      </Card>

      {/* Links */}
      <Card>
        <CardHeader title="Links" />

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Portfolio URL"
              type="url"
              {...register("portfolio")}
              placeholder="https://"
            />

            <Input
              label="GitHub URL"
              type="url"
              {...register("github")}
              placeholder="https://github.com/"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="LinkedIn URL"
              type="url"
              {...register("linkedin")}
              placeholder="https://linkedin.com/in/"
            />

            <Input
              label="Writing Samples URL"
              type="url"
              {...register("writingSamples")}
              placeholder="https://"
            />
          </div>
        </div>
      </Card>

      {/* Professional Positioning */}
      <Card>
        <CardHeader
          title="Professional Positioning"
          description="How you position yourself professionally"
        />

        <div className="space-y-6">
          <Textarea
            label="Current Positioning"
            {...register("currentPositioning", { required: "Current positioning is required" })}
            rows={4}
            placeholder="Your current professional positioning statement..."
            error={errors.currentPositioning?.message}
          />

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-4">
              Role-Specific Positioning
            </label>
            <div className="space-y-4">
              {ROLE_TYPES.map((role) => (
                <div key={role.value}>
                  <label className="block text-sm text-text-muted mb-1">{role.label}</label>
                  <textarea
                    value={byRolePositioning[role.value] || ""}
                    onChange={(e) => updateRolePositioning(role.value, e.target.value)}
                    rows={2}
                    placeholder={`Positioning for ${role.label}...`}
                    className="w-full px-4 py-2 bg-dark-layer border border-dark-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-blue resize-none"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Value Propositions */}
      <Card>
        <CardHeader
          title="Value Propositions"
          description="Key value you bring to employers"
        />

        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={newValueProp}
              onChange={(e) => setNewValueProp(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addValueProposition();
                }
              }}
              placeholder="Add a value proposition..."
              className="flex-1 px-4 py-2 bg-dark-layer border border-dark-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-blue"
            />
            <Button type="button" variant="secondary" onClick={addValueProposition}>
              Add
            </Button>
          </div>

          {valuePropositions.length > 0 && (
            <ul className="space-y-2">
              {valuePropositions.map((vp, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 p-3 bg-dark-layer rounded-lg"
                >
                  <span className="flex-1 text-text-primary">{vp}</span>
                  <button
                    type="button"
                    onClick={() => removeValueProposition(index)}
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
        </div>
      </Card>

      {/* Professional Mission */}
      <Card>
        <CardHeader title="Professional Mission" />

        <Textarea
          label="Mission Statement"
          {...register("professionalMission")}
          rows={4}
          placeholder="Your professional mission statement..."
        />
      </Card>

      {/* Unique Selling Points */}
      <Card>
        <CardHeader
          title="Unique Selling Points"
          description="What makes you stand out"
        />

        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={newUSP}
              onChange={(e) => setNewUSP(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addUniqueSellingPoint();
                }
              }}
              placeholder="Add a unique selling point..."
              className="flex-1 px-4 py-2 bg-dark-layer border border-dark-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-blue"
            />
            <Button type="button" variant="secondary" onClick={addUniqueSellingPoint}>
              Add
            </Button>
          </div>

          {uniqueSellingPoints.length > 0 && (
            <ul className="space-y-2">
              {uniqueSellingPoints.map((usp, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 p-3 bg-dark-layer rounded-lg"
                >
                  <span className="flex-1 text-text-primary">{usp}</span>
                  <button
                    type="button"
                    onClick={() => removeUniqueSellingPoint(index)}
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
        </div>
      </Card>

      {/* Form Actions */}
      <div className="flex justify-end gap-4 pt-4 border-t border-dark-border">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Profile"}
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
          valuePropositions,
          uniqueSellingPoints,
          byRolePositioning,
        }}
        contextLabel="Profile Form Data"
        collection="profile"
        roleType="technical_writer"
      />
    </form>
  );
}
