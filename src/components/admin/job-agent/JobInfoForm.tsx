import { useState } from 'react';
import type { JobType } from '../../../lib/job-agent-prompts';
import { Button, Input, Textarea, Select, Card, CardHeader } from '../ui';

interface JobInfoFormProps {
  onSubmit: (data: {
    url?: string;
    description: string;
    jobType: JobType;
    companyName?: string;
  }) => void;
  initialData?: {
    url?: string;
    description?: string;
    jobType?: JobType;
    companyName?: string;
  };
  isLoading?: boolean;
}

const JOB_TYPE_OPTIONS = [
  { value: 'technical-writer', label: 'Technical Writer' },
  { value: 'technical-writing-manager', label: 'Technical Writing Manager' },
  { value: 'software-engineer', label: 'Software Engineer' },
  { value: 'software-engineering-manager', label: 'Software Engineering Manager' },
];

export default function JobInfoForm({ onSubmit, initialData, isLoading }: JobInfoFormProps) {
  const [url, setUrl] = useState(initialData?.url || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [jobType, setJobType] = useState<JobType>(initialData?.jobType || 'technical-writer');
  const [companyName, setCompanyName] = useState(initialData?.companyName || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!description.trim()) return;

    onSubmit({
      url: url.trim() || undefined,
      description: description.trim(),
      jobType,
      companyName: companyName.trim() || undefined,
    });
  };

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-6">
        <CardHeader
          title="Job Information"
          description="Enter the job details to generate a tailored resume"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Select
            label="Job Type"
            options={JOB_TYPE_OPTIONS}
            value={jobType}
            onChange={(e) => setJobType(e.target.value as JobType)}
          />

          <Input
            label="Company Name"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="e.g., Acme Corp"
            helperText="Optional - for personalization"
          />
        </div>

        <Input
          label="Job Posting URL"
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://company.com/jobs/position"
          helperText="Optional - for reference only"
        />

        <Textarea
          label="Job Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Paste the complete job description here..."
          rows={12}
          helperText="Copy and paste the full job posting including requirements, responsibilities, and qualifications"
        />

        <div className="flex justify-end">
          <Button type="submit" disabled={!description.trim()} isLoading={isLoading}>
            {isLoading ? 'Analyzing...' : 'Analyze & Generate Resume'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
