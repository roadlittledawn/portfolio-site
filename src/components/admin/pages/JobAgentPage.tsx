import { useState } from 'react';
import type { JobType } from '../../../lib/job-agent-prompts';
import { JobInfoForm, ResumeGenerator, CoverLetterGenerator } from '../job-agent';

type Step = 'job-info' | 'resume' | 'cover-letter' | 'complete';

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

  const handleJobInfoSubmit = (data: JobInfo) => {
    setJobInfo(data);
    setStep('resume');
  };

  const handleResumeGenerated = (generatedResume: string) => {
    setResume(generatedResume);
  };

  const handleCoverLetterGenerated = (generatedCoverLetter: string) => {
    setCoverLetter(generatedCoverLetter);
    setStep('complete');
  };

  const resetWorkflow = () => {
    setStep('job-info');
    setJobInfo(null);
    setResume('');
    setCoverLetter('');
  };

  // Progress indicator
  const steps = [
    { id: 'job-info', label: 'Job Info', number: 1 },
    { id: 'resume', label: 'Resume', number: 2 },
    { id: 'cover-letter', label: 'Cover Letter', number: 3 },
    { id: 'complete', label: 'Complete', number: 4 },
  ];

  const currentStepIndex = steps.findIndex((s) => s.id === step);

  return (
    <div className="space-y-8">
      {/* Progress Indicator */}
      <div className="flex items-center justify-center">
        <div className="flex items-center gap-2">
          {steps.map((s, index) => (
            <div key={s.id} className="flex items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full font-bold transition-colors ${
                  index <= currentStepIndex
                    ? 'bg-accent-blue text-white'
                    : 'bg-dark-card border border-dark-border text-text-muted'
                }`}
              >
                {index < currentStepIndex ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  s.number
                )}
              </div>
              <span
                className={`ml-2 text-sm font-medium ${
                  index <= currentStepIndex ? 'text-text-primary' : 'text-text-muted'
                }`}
              >
                {s.label}
              </span>
              {index < steps.length - 1 && (
                <div
                  className={`w-12 h-0.5 mx-4 ${
                    index < currentStepIndex ? 'bg-accent-blue' : 'bg-dark-border'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      {step === 'job-info' && <JobInfoForm onSubmit={handleJobInfoSubmit} />}

      {step === 'resume' && jobInfo && (
        <ResumeGenerator
          jobInfo={jobInfo}
          onResumeGenerated={handleResumeGenerated}
          onBack={() => setStep('job-info')}
        />
      )}

      {step === 'resume' && resume && (
        <div className="flex justify-center mt-6">
          <button
            onClick={() => setStep('cover-letter')}
            className="px-6 py-3 bg-accent-blue hover:bg-accent-blue/80 text-white font-medium rounded-lg transition-colors"
          >
            Continue to Cover Letter
          </button>
        </div>
      )}

      {step === 'cover-letter' && jobInfo && (
        <CoverLetterGenerator
          jobInfo={jobInfo}
          resume={resume}
          onCoverLetterGenerated={handleCoverLetterGenerated}
          onBack={() => setStep('resume')}
        />
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
