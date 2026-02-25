import { useState } from 'react';
import { marked } from 'marked';
import DOMPurify from 'isomorphic-dompurify';
import type { JobType } from '../../../lib/job-agent-prompts';
import { getGraphQLClient } from '../../../lib/graphql-client';
import { GENERATE_COVER_LETTER_MUTATION } from '../../../lib/graphql';
import { Button, Card, CardHeader, Textarea } from '../ui';
import { GoogleDriveFolderSelector } from '../google-drive';
import './markdown-preview.css';

interface CoverLetterGeneratorProps {
  jobInfo: {
    description: string;
    jobType: JobType;
    companyName?: string;
  };
  resume: string;
  initialCoverLetter?: string;
  onCoverLetterGenerated: (coverLetter: string) => void;
  onBack: () => void;
  onUploadSuccess?: () => void;
}

export default function CoverLetterGenerator({
  jobInfo,
  resume,
  initialCoverLetter = '',
  onCoverLetterGenerated,
  onBack,
  onUploadSuccess,
}: CoverLetterGeneratorProps) {
  const [coverLetter, setCoverLetter] = useState<string>(initialCoverLetter);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [folderId, setFolderId] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [tone, setTone] = useState<'professional' | 'conversational' | 'enthusiastic'>('professional');
  const [customInstructions, setCustomInstructions] = useState('');

  const generateCoverLetter = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const client = getGraphQLClient();

      const toneInstructions = {
        professional: 'Use a professional, formal tone',
        conversational: 'Use a friendly, conversational tone while maintaining professionalism',
        enthusiastic: 'Use an enthusiastic, energetic tone that shows genuine excitement',
      };

      // Build job info for the GraphQL mutation
      const jobInfoInput = {
        description: jobInfo.description,
        jobType: jobInfo.jobType.replace(/-/g, '_'), // Convert to snake_case for API
      };

      // Build additional context with tone and custom instructions
      const additionalContextParts = [
        `Tone: ${toneInstructions[tone]}`,
        jobInfo.companyName ? `Company: ${jobInfo.companyName}` : '',
        customInstructions ? `Special Instructions: ${customInstructions}` : '',
        `Resume Context (for reference): ${resume.substring(0, 2000)}${resume.length > 2000 ? '...' : ''}`,
      ].filter(Boolean);

      interface GenerateCoverLetterResponse {
        generateCoverLetter: {
          content: string;
          usage: {
            inputTokens: number;
            outputTokens: number;
          };
        };
      }

      const data = await client.request<GenerateCoverLetterResponse>(
        GENERATE_COVER_LETTER_MUTATION,
        {
          jobInfo: jobInfoInput,
          additionalContext: additionalContextParts.join('\n\n'),
        }
      );

      setCoverLetter(data.generateCoverLetter.content);
      onCoverLetterGenerated(data.generateCoverLetter.content);
    } catch (err) {
      console.error('Cover letter generation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate cover letter');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadCoverLetter = () => {
    const blob = new Blob([coverLetter], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cover-letter-${jobInfo.jobType}-${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(coverLetter);
      alert('Cover letter copied to clipboard!');
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = coverLetter;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Cover letter copied to clipboard!');
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
            content: coverLetter,
            type: 'cover-letter',
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
        title="Cover Letter"
        description="Generate a personalized cover letter based on your resume"
        actions={
          <Button variant="ghost" size="sm" onClick={onBack}>
            Back to Resume
          </Button>
        }
      />

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400">
          {error}
        </div>
      )}

      {!coverLetter && (
        <div className="space-y-6">
          {/* Tone Selection */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-3">Writing Tone</label>
            <div className="flex flex-wrap gap-3">
              {(['professional', 'conversational', 'enthusiastic'] as const).map((t) => (
                <label
                  key={t}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-colors ${
                    tone === t
                      ? 'bg-accent-blue/20 border-accent-blue text-accent-blue'
                      : 'bg-dark-layer border-dark-border text-text-secondary hover:border-dark-hover'
                  }`}
                >
                  <input
                    type="radio"
                    name="tone"
                    value={t}
                    checked={tone === t}
                    onChange={() => setTone(t)}
                    className="sr-only"
                  />
                  <span className="capitalize">{t}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Custom Instructions */}
          <Textarea
            label="Special Instructions (optional)"
            value={customInstructions}
            onChange={(e) => setCustomInstructions(e.target.value)}
            placeholder="Any specific points to emphasize, company values to reference, etc."
            rows={3}
          />

          <div className="flex justify-center">
            <Button onClick={generateCoverLetter} isLoading={isGenerating} size="lg">
              {isGenerating ? 'Generating Cover Letter...' : 'Generate Cover Letter'}
            </Button>
          </div>
        </div>
      )}

      {coverLetter && (
        <div className="space-y-6">
          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <Button onClick={downloadCoverLetter} variant="secondary">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download
            </Button>
            <Button onClick={copyToClipboard} variant="secondary">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy
            </Button>
            <Button onClick={() => setCoverLetter('')} variant="ghost">
              Regenerate
            </Button>
          </div>

          {/* Preview */}
          <div className="border border-dark-border rounded-lg overflow-hidden">
            <div className="px-4 py-2 bg-dark-layer border-b border-dark-border">
              <span className="text-sm font-medium text-text-secondary">Preview</span>
            </div>
            <div
              className="p-6 bg-white text-gray-900 overflow-auto max-h-[500px] markdown-preview"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(marked(coverLetter) as string) }}
            />
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
                Upload Cover Letter to Drive
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
