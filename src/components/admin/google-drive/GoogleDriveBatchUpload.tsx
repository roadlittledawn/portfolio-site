import { useState } from 'react';
import { Button, Card, CardHeader } from '../ui';
import GoogleDriveFolderSelector from './GoogleDriveFolderSelector';

interface UploadResult {
  type: string;
  fileId: string;
  fileName: string;
  webViewLink: string;
}

interface GoogleDriveBatchUploadProps {
  resume: string;
  coverLetter: string;
  jobDescription: string;
  jobTitle: string;
  companyName: string;
}

export default function GoogleDriveBatchUpload({
  resume,
  coverLetter,
  jobDescription,
  jobTitle,
  companyName,
}: GoogleDriveBatchUploadProps) {
  const [resumeFolderId, setResumeFolderId] = useState('');
  const [coverLetterFolderId, setCoverLetterFolderId] = useState('');
  const [jobDescFolderId, setJobDescFolderId] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploads, setUploads] = useState<UploadResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleUploadAll = async () => {
    if (!resumeFolderId || !coverLetterFolderId || !jobDescFolderId) {
      setError('Please select folders for all files');
      return;
    }

    setUploading(true);
    setError(null);
    setUploads([]);

    try {
      const response = await fetch('/api/google-drive-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          files: [
            {
              content: resume,
              type: 'resume',
              folderId: resumeFolderId,
              jobTitle,
              companyName,
            },
            {
              content: coverLetter,
              type: 'cover-letter',
              folderId: coverLetterFolderId,
              jobTitle,
              companyName,
            },
            {
              content: jobDescription,
              type: 'job-description',
              folderId: jobDescFolderId,
              jobTitle,
              companyName,
            },
          ],
        }),
      });

      const data = await response.json();

      if (data.success) {
        setUploads(data.uploads);
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
        title="Upload to Google Drive"
        description="Select folders and upload all files at once"
      />
      <div className="space-y-4">
        <GoogleDriveFolderSelector
          label="Resume Folder"
          value={resumeFolderId}
          onChange={setResumeFolderId}
          disabled={uploading}
        />
        <GoogleDriveFolderSelector
          label="Cover Letter Folder"
          value={coverLetterFolderId}
          onChange={setCoverLetterFolderId}
          disabled={uploading}
        />
        <GoogleDriveFolderSelector
          label="Job Description Folder"
          value={jobDescFolderId}
          onChange={setJobDescFolderId}
          disabled={uploading}
        />

        <Button
          onClick={handleUploadAll}
          isLoading={uploading}
          disabled={!resumeFolderId || !coverLetterFolderId || !jobDescFolderId}
          className="w-full"
        >
          Upload All to Drive
        </Button>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        {uploads.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-accent-green">Successfully uploaded:</p>
            {uploads.map((upload) => (
              <a
                key={upload.fileId}
                href={upload.webViewLink}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-2 bg-dark-card border border-dark-border rounded hover:bg-dark-hover transition-colors"
              >
                <span className="text-sm text-text-primary">{upload.fileName}</span>
              </a>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
