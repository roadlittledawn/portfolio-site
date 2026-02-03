import { useState } from 'react';
import type { JobType } from '../../../lib/job-agent-prompts';
import { JobInfoForm, ResumeGenerator, CoverLetterGenerator } from '../job-agent';
import { Button, Card, CardHeader, Textarea } from '../ui';

type Step = 'job-info' | 'context' | 'resume' | 'cover-letter' | 'complete';

interface JobInfo {
  description: string;
  jobType: JobType;
  companyName?: string;
  url?: string;
}

export default function JobAgentPage() {
  const [step, setStep] = useState<Step>('job-info');
  const [jobInfo, setJobInfo] = useState<JobInfo | null>(null);
  const [resume, setResume] = useState<string>('');
  const [coverLetter, setCoverLetter] = useState<string>('');
  const [additionalContext, setAdditionalContext] = useState<string>('');

  const handleJobInfoSubmit = (data: JobInfo) => {
    setJobInfo(data);
    setStep('context');
  };

  const handleResumeGenerated = (generatedResume: string) => {
    setResume(generatedResume);
  };

  const handleCoverLetterGenerated = (generatedCoverLetter: string) => {
    setCoverLetter(generatedCoverLetter);
  };

  const resetWorkflow = () => {
    setStep('job-info');
    setJobInfo(null);
    setResume('');
    setCoverLetter('');
    setAdditionalContext('');
  };

  // Progress indicator
  const steps = [
    { id: 'job-info', label: 'Job Info', number: 1 },
    { id: 'context', label: 'Context', number: 2 },
    { id: 'resume', label: 'Resume', number: 3 },
    { id: 'cover-letter', label: 'Cover Letter', number: 4 },
    { id: 'complete', label: 'Complete', number: 5 },
  ] as const;

  const currentStepIndex = steps.findIndex((s) => s.id === step);

  // Determine which steps are accessible (completed or current)
  const getHighestCompletedStepIndex = () => {
    if (coverLetter) return 4; // Can access complete
    if (resume) return 3; // Can access cover-letter
    if (jobInfo) return 2; // Can access context and resume (context is optional)
    return 0; // Only job-info
  };

  const highestAccessibleIndex = getHighestCompletedStepIndex();

  const handleStepClick = (stepId: Step, index: number) => {
    // Can only click on steps that have been completed or are current
    if (index <= highestAccessibleIndex) {
      setStep(stepId);
    }
  };

  return (
    <div className="space-y-8">
      {/* Progress Indicator */}
      <div className="flex items-center justify-center">
        <div className="flex items-center gap-2">
          {steps.map((s, index) => {
            const isAccessible = index <= highestAccessibleIndex;
            const isCompleted = index < currentStepIndex;
            const isCurrent = index === currentStepIndex;

            return (
              <div key={s.id} className="flex items-center">
                <button
                  onClick={() => handleStepClick(s.id as Step, index)}
                  disabled={!isAccessible}
                  className={`flex items-center justify-center w-10 h-10 rounded-full font-bold transition-colors ${
                    isCurrent
                      ? 'bg-accent-blue text-white'
                      : isCompleted
                        ? 'bg-accent-blue/70 text-white hover:bg-accent-blue cursor-pointer'
                        : isAccessible
                          ? 'bg-dark-card border border-dark-border text-text-muted hover:bg-dark-hover cursor-pointer'
                          : 'bg-dark-card border border-dark-border text-text-muted cursor-not-allowed opacity-50'
                  }`}
                >
                  {isCompleted ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    s.number
                  )}
                </button>
                <span
                  className={`ml-2 text-sm font-medium ${
                    isAccessible ? 'text-text-primary' : 'text-text-muted'
                  } ${isAccessible && !isCurrent ? 'cursor-pointer hover:text-accent-blue' : ''}`}
                  onClick={() => isAccessible && handleStepClick(s.id as Step, index)}
                >
                  {s.label}
                </span>
                {index < steps.length - 1 && (
                  <div
                    className={`w-12 h-0.5 mx-4 ${
                      isCompleted ? 'bg-accent-blue' : 'bg-dark-border'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      {step === 'job-info' && (
        <JobInfoForm
          onSubmit={handleJobInfoSubmit}
          initialData={jobInfo || undefined}
        />
      )}

      {step === 'context' && jobInfo && (
        <Card>
          <CardHeader
            title="Additional Context"
            description="Optionally provide extra information to personalize your resume"
            actions={
              <Button variant="ghost" size="sm" onClick={() => setStep('job-info')}>
                Back to Job Info
              </Button>
            }
          />
          <div className="space-y-6">
            <Textarea
              label="Additional Context (Optional)"
              value={additionalContext}
              onChange={(e) => setAdditionalContext(e.target.value)}
              placeholder="Any specific skills, projects, achievements, or experiences you want to highlight for this role..."
              rows={6}
              helperText="This helps tailor the resume to emphasize your most relevant qualifications"
            />
            <div className="flex justify-between">
              <Button variant="ghost" onClick={() => setStep('job-info')}>
                Back
              </Button>
              <Button onClick={() => setStep('resume')}>
                Continue to Resume
              </Button>
            </div>
          </div>
        </Card>
      )}

      {step === 'resume' && jobInfo && (
        <>
          <ResumeGenerator
            jobInfo={jobInfo}
            initialResume={resume}
            additionalContext={additionalContext}
            onResumeGenerated={handleResumeGenerated}
            onBack={() => setStep('context')}
          />
          {resume && (
            <div className="flex justify-center mt-6">
              <button
                onClick={() => setStep('cover-letter')}
                className="px-6 py-3 bg-accent-blue hover:bg-accent-blue/80 text-white font-medium rounded-lg transition-colors"
              >
                Continue to Cover Letter
              </button>
            </div>
          )}
        </>
      )}

      {step === 'cover-letter' && jobInfo && (
        <>
          <CoverLetterGenerator
            jobInfo={jobInfo}
            resume={resume}
            initialCoverLetter={coverLetter}
            onCoverLetterGenerated={handleCoverLetterGenerated}
            onBack={() => setStep('resume')}
          />
          {coverLetter && (
            <div className="flex justify-center mt-6">
              <button
                onClick={() => setStep('complete')}
                className="px-6 py-3 bg-accent-blue hover:bg-accent-blue/80 text-white font-medium rounded-lg transition-colors"
              >
                Continue to Complete
              </button>
            </div>
          )}
        </>
      )}

      {step === 'complete' && (
        <div className="text-center space-y-6">
          <div className="p-8 bg-dark-card border border-dark-border rounded-lg">
            <div className="w-16 h-16 mx-auto mb-4 bg-accent-green/20 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-accent-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-text-primary mb-2">Application Materials Ready!</h2>
            <p className="text-text-secondary mb-6">
              Your tailored resume and cover letter have been generated.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setStep('resume')}
                className="px-4 py-2 bg-dark-layer border border-dark-border text-text-primary rounded-lg hover:bg-dark-hover transition-colors"
              >
                View Resume
              </button>
              <button
                onClick={() => setStep('cover-letter')}
                className="px-4 py-2 bg-dark-layer border border-dark-border text-text-primary rounded-lg hover:bg-dark-hover transition-colors"
              >
                View Cover Letter
              </button>
              <button
                onClick={resetWorkflow}
                className="px-4 py-2 bg-accent-blue text-white rounded-lg hover:bg-accent-blue/80 transition-colors"
              >
                Start New Application
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
