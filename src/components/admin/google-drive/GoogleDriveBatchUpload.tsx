import { useState, useEffect } from 'react';
import { Button, Card, CardHeader } from '../ui';
import GoogleDriveFolderSelector from './GoogleDriveFolderSelector';
import { getDefaultFolderForRole } from '../../../lib/constants';

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
  resumeUploaded?: boolean;
  coverLetterUploaded?: boolean;
  jobDescUploaded?: boolean;
  onUploadSuccess?: (type: 'resume' | 'cover-letter' | 'job-description') => void;
}

export default function GoogleDriveBatchUpload({
  resume,
  coverLetter,
  jobDescription,
  jobTitle,
  companyName,
  resumeUploaded = false,
  coverLetterUploaded = false,
  jobDescUploaded = false,
  onUploadSuccess,
}: GoogleDriveBatchUploadProps) {
  const [resumeFolderId, setResumeFolderId] = useState('');
  const [coverLetterFolderId, setCoverLetterFolderId] = useState('');
  const [jobDescFolderId, setJobDescFolderId] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploads, setUploads] = useState<UploadResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Set default folders based on role type
  useEffect(() => {
    const defaultAppFolder = getDefaultFolderForRole(jobTitle, 'application');
    const defaultJdFolder = getDefaultFolderForRole(jobTitle, 'job-description');
    
    if (defaultAppFolder && !resumeUploaded) {
      setResumeFolderId(defaultAppFolder);
      setCoverLetterFolderId(defaultAppFolder);
    }
    
    if (defaultJdFolder && !jobDescUploaded) {
      setJobDescFolderId(defaultJdFolder);
    }
  }, [jobTitle, resumeUploaded, jobDescUploaded]);

  const handleUploadAll = async () => {
    // Build list of files to upload (only those with folder selected and not already uploaded)
    const filesToUpload = [];
    
    if (resumeFolderId && !resumeUploaded) {
      filesToUpload.push({
        content: resume,
        type: 'resume',
        folderId: resumeFolderId,
        jobTitle,
        companyName,
      });
    }
    
    if (coverLetterFolderId && !coverLetterUploaded) {
      filesToUpload.push({
        content: coverLetter,
        type: 'cover-letter',
        folderId: coverLetterFolderId,
        jobTitle,
        companyName,
      });
    }
    
    if (jobDescFolderId && !jobDescUploaded) {
      filesToUpload.push({
        content: jobDescription,
        type: 'job-description',
        folderId: jobDescFolderId,
        jobTitle,
        companyName,
      });
    }

    if (filesToUpload.length === 0) {
      setError('Please select folders for files you want to upload');
      return;
    }

    setUploading(true);
    setError(null);
    setUploads([]);

    try {
      const response = await fetch('/.netlify/functions/google-drive-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ files: filesToUpload }),
      });

      const data = await response.json();

      if (data.success) {
        setUploads(data.uploads);
        // Notify parent of successful uploads
        data.uploads.forEach((upload: UploadResult) => {
          onUploadSuccess?.(upload.type as 'resume' | 'cover-letter' | 'job-description');
        });
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
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-text-primary">Resume</label>
            {resumeUploaded && (
              <span className="text-xs text-accent-green">✓ Uploaded</span>
            )}
          </div>
          <GoogleDriveFolderSelector
            label=""
            value={resumeFolderId}
            onChange={setResumeFolderId}
            disabled={uploading || resumeUploaded}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-text-primary">Cover Letter</label>
            {coverLetterUploaded && (
              <span className="text-xs text-accent-green">✓ Uploaded</span>
            )}
          </div>
          <GoogleDriveFolderSelector
            label=""
            value={coverLetterFolderId}
            onChange={setCoverLetterFolderId}
            disabled={uploading || coverLetterUploaded}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-text-primary">Job Description</label>
            {jobDescUploaded && (
              <span className="text-xs text-accent-green">✓ Uploaded</span>
            )}
          </div>
          <GoogleDriveFolderSelector
            label=""
            value={jobDescFolderId}
            onChange={setJobDescFolderId}
            disabled={uploading || jobDescUploaded}
          />
        </div>

        <Button
          onClick={handleUploadAll}
          isLoading={uploading}
          disabled={
            (!resumeFolderId && !coverLetterFolderId && !jobDescFolderId) ||
            (resumeUploaded && coverLetterUploaded && jobDescUploaded)
          }
          className="w-full"
        >
          {resumeUploaded && coverLetterUploaded && jobDescUploaded
            ? 'All Files Uploaded'
            : 'Upload Selected to Drive'}
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
