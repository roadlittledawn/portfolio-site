import { useState, useEffect } from 'react';
import { marked } from 'marked';
import DOMPurify from 'isomorphic-dompurify';
import type { JobType } from '../../../lib/job-agent-prompts';
import { getGraphQLClient } from '../../../lib/graphql-client';
import { GENERATE_RESUME_MUTATION } from '../../../lib/graphql';
import { Button, Card, CardHeader } from '../ui';
import { GoogleDriveFolderSelector } from '../google-drive';
import { getDefaultFolderForRole } from '../../../lib/constants';
import './markdown-preview.css';

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

  // Set default folder based on role type
  useEffect(() => {
    const defaultFolder = getDefaultFolderForRole(jobInfo.jobType, 'application');
    if (defaultFolder) {
      setFolderId(defaultFolder);
    }
  }, [jobInfo.jobType]);

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
    const blob = new Blob([resume], { type: 'text/markdown' });
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
      await navigator.clipboard.writeText(resume);
      alert('Resume copied to clipboard!');
    } catch {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = resume;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Resume copied to clipboard!');
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
            content: resume,
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
            <Button onClick={() => setResume('')} variant="ghost">
              Regenerate
            </Button>
          </div>

          {/* Preview */}
          <div className="border border-dark-border rounded-lg overflow-hidden">
            <div className="px-4 py-2 bg-dark-layer border-b border-dark-border">
              <span className="text-sm font-medium text-text-secondary">Preview</span>
            </div>
            <div
              className="p-6 bg-white text-gray-900 overflow-auto max-h-[600px] markdown-preview"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(marked(resume) as string) }}
            />
          </div>

          {/* Raw Markdown */}
          <details>
            <summary className="text-sm text-text-secondary hover:text-text-primary cursor-pointer">
              View Raw Markdown
            </summary>
            <pre className="mt-2 p-4 bg-dark-layer rounded-lg text-sm text-text-primary overflow-auto max-h-96">
              {resume}
            </pre>
          </details>

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
                  ✓ Uploaded successfully - View in Drive
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
