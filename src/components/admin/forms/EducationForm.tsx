import { useState } from "react";
import { useForm } from "react-hook-form";
import type { Education } from "../../../lib/types";
import { Button, Input, Card, CardHeader } from "../ui";
import Tag from "../ui/Tag";

interface EducationFormProps {
  initialData?: Education;
  onSubmit: (data: Partial<Education>) => Promise<void>;
  onCancel: () => void;
}

export default function EducationForm({
  initialData,
  onSubmit,
  onCancel,
}: EducationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [relevantCoursework, setRelevantCoursework] = useState<string[]>(
    initialData?.relevantCoursework || []
  );
  const [newCourse, setNewCourse] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      institution: initialData?.institution || "",
      degree: initialData?.degree || "",
      field: initialData?.field || "",
      graduationYear: initialData?.graduationYear || new Date().getFullYear(),
    },
  });

  const onFormSubmit = async (data: any) => {
    setError("");
    setIsSubmitting(true);

    try {
      const educationData: Partial<Education> = {
        institution: data.institution,
        degree: data.degree,
        field: data.field,
        graduationYear: parseInt(data.graduationYear),
        relevantCoursework,
      };

      await onSubmit(educationData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save education");
      setIsSubmitting(false);
    }
  };

  const addCourse = () => {
    if (newCourse.trim() && !relevantCoursework.includes(newCourse.trim())) {
      setRelevantCoursework([...relevantCoursework, newCourse.trim()]);
      setNewCourse("");
    }
  };

  const removeCourse = (index: number) => {
    setRelevantCoursework(relevantCoursework.filter((_, i) => i !== index));
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
          <Input
            label="Institution"
            {...register("institution", { required: "Institution is required" })}
            placeholder="e.g., University of California, Berkeley"
            error={errors.institution?.message}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Degree"
              {...register("degree", { required: "Degree is required" })}
              placeholder="e.g., Bachelor of Science"
              error={errors.degree?.message}
            />

            <Input
              label="Field of Study"
              {...register("field", { required: "Field is required" })}
              placeholder="e.g., Computer Science"
              error={errors.field?.message}
            />
          </div>

          <div className="max-w-xs">
            <Input
              label="Graduation Year"
              type="number"
              {...register("graduationYear", {
                required: "Graduation year is required",
                min: { value: 1950, message: "Year must be 1950 or later" },
                max: { value: 2050, message: "Year cannot exceed 2050" },
              })}
              error={errors.graduationYear?.message}
            />
          </div>
        </div>
      </Card>

      {/* Relevant Coursework */}
      <Card>
        <CardHeader
          title="Relevant Coursework"
          description="Add relevant courses (optional but required by schema)"
        />

        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newCourse}
            onChange={(e) => setNewCourse(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addCourse();
              }
            }}
            placeholder="Add a course..."
            className="flex-1 px-4 py-2 bg-dark-layer border border-dark-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-blue"
          />
          <Button type="button" variant="secondary" onClick={addCourse}>
            Add
          </Button>
        </div>

        {relevantCoursework.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {relevantCoursework.map((course, index) => (
              <Tag key={index} onRemove={() => removeCourse(index)}>
                {course}
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
          {isSubmitting ? "Saving..." : "Save Education"}
        </Button>
      </div>
    </form>
  );
}
