import { useState } from 'react';
import { marked } from 'marked';
import type { JobType } from '../../../lib/job-agent-prompts';
import { getAuthToken } from '../../../lib/auth';
import { Button, Card, CardHeader, Textarea } from '../ui';

interface CoverLetterGeneratorProps {
  jobInfo: {
    description: string;
    jobType: JobType;
    companyName?: string;
  };
  resume: string;
  onCoverLetterGenerated: (coverLetter: string) => void;
  onBack: () => void;
}

export default function CoverLetterGenerator({
  jobInfo,
  resume,
  onCoverLetterGenerated,
  onBack,
}: CoverLetterGeneratorProps) {
  const [coverLetter, setCoverLetter] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tone, setTone] = useState<'professional' | 'conversational' | 'enthusiastic'>('professional');
  const [customInstructions, setCustomInstructions] = useState('');

  const generateCoverLetter = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Not authenticated');
      }

      const toneInstructions = {
        professional: 'Use a professional, formal tone',
        conversational: 'Use a friendly, conversational tone while maintaining professionalism',
        enthusiastic: 'Use an enthusiastic, energetic tone that shows genuine excitement',
      };

      const messages = [
        {
          role: 'user' as const,
          content: `Please generate a cover letter for the following job application:

**Job Type:** ${jobInfo.jobType.replace(/-/g, ' ')}
${jobInfo.companyName ? `**Company:** ${jobInfo.companyName}` : ''}

**Job Description:**
${jobInfo.description}

**Tone:** ${toneInstructions[tone]}

${customInstructions ? `**Special Instructions:**\n${customInstructions}` : ''}

**Resume Context (for reference):**
${resume.substring(0, 2000)}${resume.length > 2000 ? '...' : ''}

Please write a compelling cover letter that:
1. Opens with a strong hook relevant to the position
2. Highlights 2-3 key achievements from my experience
3. Shows genuine interest in the company and role
4. Ends with a clear call to action

Output the cover letter in clean, professional format.`,
        },
      ];

      const response = await fetch('/.netlify/functions/ai-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          messages,
          context: {
            editingContext: {
              collection: 'cover-letter',
              roleType: jobInfo.jobType.replace(/-/g, '_'),
            },
            profileSummary: {
              name: 'User',
              positioning: '',
              valueProps: [],
            },
          },
          options: {
            maxTokens: 2000,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate cover letter');
      }

      const data = await response.json();
      setCoverLetter(data.message.content);
      onCoverLetterGenerated(data.message.content);
    } catch (err) {
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
              className="p-6 bg-white text-gray-900 prose prose-sm max-w-none overflow-auto max-h-[500px]"
              dangerouslySetInnerHTML={{ __html: marked(coverLetter) }}
            />
          </div>
        </div>
      )}
    </Card>
  );
}
