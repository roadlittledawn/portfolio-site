import { useState, useEffect } from 'react';
import { marked } from 'marked';
import DOMPurify from 'isomorphic-dompurify';
import type { JobType } from '../../../lib/job-agent-prompts';
import { getGraphQLClient } from '../../../lib/graphql-client';
import { GENERATE_RESUME_MUTATION, REVISE_RESUME_MUTATION } from '../../../lib/graphql';
import { Button, Card, CardHeader } from '../ui';
import { GoogleDriveFolderSelector } from '../google-drive';
import { getDefaultFolderForRole } from '../../../lib/constants';
import './markdown-preview.css';

type TabType = 'edit' | 'preview';

interface ResumeGeneratorProps {
  jobInfo: {
    description: string;
    jobType: JobType;
    companyName?: string;
    url?: string;
  };
  initialResume?: string;
  additionalContext?: string;
  onResumeGenerated: (resume: string) => void;
  onBack: () => void;
  onUploadSuccess?: () => void;
}

export default function ResumeGenerator({
  jobInfo,
  initialResume = '',
  additionalContext = '',
  onResumeGenerated,
  onBack,
  onUploadSuccess,
}: ResumeGeneratorProps) {
  const [resume, setResume] = useState<string>(initialResume);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [folderId, setFolderId] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  // Editing state
  const [activeTab, setActiveTab] = useState<TabType>('preview');
  const [editedResume, setEditedResume] = useState<string>(initialResume);
  const hasUnsavedChanges = editedResume !== resume;

  // AI refinement state
  const [isRefining, setIsRefining] = useState(false);
  const [refinementFeedback, setRefinementFeedback] = useState('');
  const [showRefinement, setShowRefinement] = useState(false);

  // Set default folder based on role type
  useEffect(() => {
    const defaultFolder = getDefaultFolderForRole(jobInfo.jobType, 'application');
    if (defaultFolder) {
      setFolderId(defaultFolder);
    }
  }, [jobInfo.jobType]);

  // Sync editedResume when resume changes (from generation or AI refinement)
  useEffect(() => {
    setEditedResume(resume);
  }, [resume]);

  const generateResume = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const client = getGraphQLClient();

      // Build job info for the GraphQL mutation
      const jobInfoInput = {
        description: jobInfo.description,
        jobType: jobInfo.jobType.replace(/-/g, '_'), // Convert to snake_case for API
      };

      interface GenerateResumeResponse {
        generateResume: {
          content: string;
          usage: {
            inputTokens: number;
            outputTokens: number;
          };
        };
      }

      const data = await client.request<GenerateResumeResponse>(
        GENERATE_RESUME_MUTATION,
        {
          jobInfo: jobInfoInput,
          additionalContext: additionalContext || null,
        }
      );

      setResume(data.generateResume.content);
      onResumeGenerated(data.generateResume.content);
    } catch (err) {
      console.error('Resume generation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate resume');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadResume = () => {
    const blob = new Blob([editedResume], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resume-${jobInfo.jobType}-${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(editedResume);
      alert('Resume copied to clipboard!');
    } catch {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = editedResume;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Resume copied to clipboard!');
    }
  };

  const handleApplyChanges = () => {
    setResume(editedResume);
    onResumeGenerated(editedResume);
  };

  const handleDiscardChanges = () => {
    setEditedResume(resume);
    setActiveTab('preview');
  };

  const handleRegenerateClick = () => {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm(
        'You have unsaved changes. Are you sure you want to regenerate? Your edits will be lost.'
      );
      if (!confirmed) return;
    }
    setResume('');
    setEditedResume('');
  };

  const handleRefineResume = async () => {
    if (!refinementFeedback.trim()) return;

    setIsRefining(true);
    setError(null);

    try {
      const client = getGraphQLClient();

      const jobInfoInput = {
        description: jobInfo.description,
        jobType: jobInfo.jobType.replace(/-/g, '_'),
      };

      interface ReviseResumeResponse {
        reviseResume: {
          content: string;
          usage: {
            inputTokens: number;
            outputTokens: number;
          };
        };
      }

      const data = await client.request<ReviseResumeResponse>(
        REVISE_RESUME_MUTATION,
        {
          jobInfo: jobInfoInput,
          feedback: refinementFeedback,
        }
      );

      setResume(data.reviseResume.content);
      setEditedResume(data.reviseResume.content);
      onResumeGenerated(data.reviseResume.content);
      setRefinementFeedback('');
      setActiveTab('preview');
    } catch (err) {
      console.error('Resume refinement error:', err);
      setError(err instanceof Error ? err.message : 'Failed to refine resume');
    } finally {
      setIsRefining(false);
    }
  };

  const handleUpload = async () => {
    if (!folderId) return;

    setUploading(true);
    setError(null);
    setUploadSuccess(null);

    try {
      const response = await fetch('/.netlify/functions/google-drive-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          files: [{
            content: editedResume,
            type: 'resume',
            folderId,
            jobTitle: jobInfo.jobType,
            companyName: jobInfo.companyName || 'company',
          }],
        }),
      });

      const data = await response.json();

      if (data.success && data.uploads[0]) {
        setUploadSuccess(data.uploads[0].webViewLink);
        onUploadSuccess?.();
      } else {
        setError(data.error || 'Upload failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader
        title="Tailored Resume"
        description={`Generating resume for ${jobInfo.jobType.replace(/-/g, ' ')} position${jobInfo.companyName ? ` at ${jobInfo.companyName}` : ''}`}
        actions={
          <Button variant="ghost" size="sm" onClick={onBack}>
            Back to Job Info
          </Button>
        }
      />

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400">
          {error}
        </div>
      )}

      {!resume && (
        <div className="space-y-6">
          {additionalContext && (
            <div className="p-4 bg-dark-layer border border-dark-border rounded-lg">
              <p className="text-sm text-text-secondary mb-1">Additional context provided:</p>
              <p className="text-sm text-text-primary">{additionalContext}</p>
            </div>
          )}

          <div className="flex justify-center">
            <Button onClick={generateResume} isLoading={isGenerating} size="lg">
              {isGenerating ? 'Generating Resume...' : 'Generate Tailored Resume'}
            </Button>
          </div>
        </div>
      )}

      {resume && (
        <div className="space-y-6">
          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <Button onClick={downloadResume} variant="secondary">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download Markdown
            </Button>
            <Button onClick={copyToClipboard} variant="secondary">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy to Clipboard
            </Button>
            <Button onClick={handleRegenerateClick} variant="ghost">
              Regenerate
            </Button>
          </div>

          {/* Tab-based Edit/Preview */}
          <div className="border border-dark-border rounded-lg overflow-hidden">
            {/* Tab Bar */}
            <div className="flex bg-dark-layer border-b border-dark-border">
              <button
                onClick={() => setActiveTab('edit')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'edit'
                    ? 'text-accent-blue border-b-2 border-accent-blue bg-dark-surface'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                <svg className="w-4 h-4 inline mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </button>
              <button
                onClick={() => setActiveTab('preview')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'preview'
                    ? 'text-accent-blue border-b-2 border-accent-blue bg-dark-surface'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                <svg className="w-4 h-4 inline mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Preview
              </button>
              {hasUnsavedChanges && (
                <span className="ml-auto px-3 py-2 text-xs text-amber-400 flex items-center">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <circle cx="10" cy="10" r="6" />
                  </svg>
                  Unsaved changes
                </span>
              )}
            </div>

            {/* Editor */}
            {activeTab === 'edit' && (
              <div className="bg-dark-surface">
                <textarea
                  value={editedResume}
                  onChange={(e) => setEditedResume(e.target.value)}
                  className="w-full h-[500px] p-4 bg-dark-surface text-text-primary font-mono text-sm resize-none focus:outline-none"
                  placeholder="Edit your resume markdown here..."
                />
              </div>
            )}

            {/* Preview */}
            {activeTab === 'preview' && (
              <div
                className="p-6 bg-white text-gray-900 overflow-auto max-h-[600px] markdown-preview"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(marked(editedResume) as string) }}
              />
            )}
          </div>

          {/* Apply/Discard Changes */}
          {hasUnsavedChanges && (
            <div className="flex gap-3 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
              <Button onClick={handleApplyChanges} size="sm">
                Apply Changes
              </Button>
              <Button onClick={handleDiscardChanges} variant="ghost" size="sm">
                Discard Changes
              </Button>
              <span className="ml-auto text-sm text-amber-400 flex items-center">
                Your edits will be used for download, copy, and upload
              </span>
            </div>
          )}

          {/* AI Refinement Panel */}
          <div className="border border-dark-border rounded-lg overflow-hidden">
            <button
              onClick={() => setShowRefinement(!showRefinement)}
              className="w-full px-4 py-3 bg-dark-layer text-left flex items-center justify-between hover:bg-dark-surface transition-colors"
            >
              <span className="text-sm font-medium text-text-primary flex items-center">
                <svg className="w-4 h-4 mr-2 text-accent-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                AI Refinement
              </span>
              <svg
                className={`w-4 h-4 text-text-secondary transition-transform ${showRefinement ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showRefinement && (
              <div className="p-4 bg-dark-surface border-t border-dark-border space-y-4">
                <p className="text-sm text-text-secondary">
                  Provide feedback to have AI revise the resume. Note: This regenerates from the original job context, so manual edits will be replaced.
                </p>
                <textarea
                  value={refinementFeedback}
                  onChange={(e) => setRefinementFeedback(e.target.value)}
                  placeholder="e.g., Make it more concise, emphasize leadership experience, add more metrics..."
                  className="w-full h-24 p-3 bg-dark-layer border border-dark-border rounded-lg text-text-primary text-sm resize-none focus:outline-none focus:border-accent-blue"
                />
                <Button
                  onClick={handleRefineResume}
                  isLoading={isRefining}
                  disabled={!refinementFeedback.trim()}
                  size="sm"
                >
                  {isRefining ? 'Refining...' : 'Request AI Refinement'}
                </Button>
              </div>
            )}
          </div>

          {/* Upload to Google Drive */}
          <div className="border-t border-dark-border pt-6">
            <h3 className="text-lg font-medium text-text-primary mb-4">Upload to Google Drive</h3>
            <div className="space-y-4">
              <GoogleDriveFolderSelector
                value={folderId}
                onChange={setFolderId}
                disabled={uploading}
              />
              <Button
                onClick={handleUpload}
                isLoading={uploading}
                disabled={!folderId}
              >
                Upload Resume to Drive
              </Button>
              {uploadSuccess && (
                <a
                  href={uploadSuccess}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-3 bg-accent-green/10 border border-accent-green/20 rounded-lg text-accent-green text-sm hover:bg-accent-green/20 transition-colors"
                >
                  Uploaded successfully - View in Drive
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
