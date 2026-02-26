# Google Drive Upload Feature - Complete Design & Implementation Plan

**Created:** 2026-02-25  
**Status:** Planning Phase  
**Related Projects:** api-career-data, portfolio-site

---

## Problem Statement

Users need the ability to upload generated resumes, cover letters, and job descriptions as Markdown files to Google Drive. This feature should be triggered from the portfolio site's Job Agent page, allowing users to organize their job application materials in designated Google Drive folders.

---

## Requirements Summary

**What we're building:**
- Google Drive upload capability for resume, cover letter, and job description as markdown files
- OAuth2 authentication with "Connect Google Drive" button
- Individual upload buttons on Resume and Cover Letter pages
- Batch "Upload All" button on Complete page
- User selects target folder for each file independently from a predefined list
- File naming: `YYYY-MM-DD-FILE-TYPE-JOB-TITLE-COMPANY.md`

**Key Decisions:**
1. OAuth initiated via separate "Connect Google Drive" button
2. Tokens stored in MongoDB
3. User selects from predefined folder list (8 folders, hardcoded in constants)
4. OAuth callback handled by Netlify function
5. Upload operations handled by Netlify function (not Lambda)
6. Job description upload only available on Complete page
7. Each file's folder selection is independent

---

## Architecture Design

### System Components


┌─────────────────────────────────────────────────────────────┐
│                    Portfolio Site (Astro + React)            │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Job Agent Page                                         │ │
│  │  - Resume Step: [Select Folder] [Upload Resume]        │ │
│  │  - Cover Letter: [Select Folder] [Upload Cover Letter] │ │
│  │  - Complete: [Select Folders] [Upload All to Drive]    │ │
│  │  - [Connect Google Drive] button (if not connected)    │ │
│  └────────────────────────────────────────────────────────┘ │
│                           │                                   │
│                           ▼                                   │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Netlify Functions                                      │ │
│  │  - /api/google-oauth-init (start OAuth)                │ │
│  │  - /api/google-oauth-callback (handle callback)        │ │
│  │  - /api/google-drive-upload (upload files)             │ │
│  │  - /api/google-drive-status (check connection)         │ │
│  └────────────────────────────────────────────────────────┘ │
└───────────────────────────┬───────────────────────────────────┘
                           │
                           ▼
               ┌───────────────────────┐
               │   MongoDB Atlas       │
               │  - oauth_tokens       │
               │    collection         │
               └───────────────────────┘
                           │
                           ▼
               ┌───────────────────────┐
               │  Google Drive API     │
               │  - OAuth 2.0          │
               │  - Files API v3       │
               └───────────────────────┘

### Data Flow

**OAuth Flow:**

1. User clicks "Connect Google Drive"
  → Calls /api/google-oauth-init
  → Redirects to Google OAuth consent screen

2. User authorizes
  → Google redirects to /api/google-oauth-callback
  → Netlify function exchanges code for tokens
  → Stores refresh_token in MongoDB oauth_tokens collection
  → Redirects back to Job Agent page with success message

3. UI updates to show "Connected" status

**Upload Flow:**

1. User generates resume/cover letter
2. User selects folder from dropdown
3. User clicks "Upload Resume" (or "Upload All")
  → Calls /api/google-drive-upload with:
      - file content (markdown)
      - file type (resume/cover-letter/job-description)
      - folder ID
      - job title & company name
  → Netlify function:
      - Retrieves refresh_token from MongoDB
      - Gets/refreshes access_token
      - Generates filename with date
      - Uploads to Google Drive
      - Returns file URL/ID
4. UI shows success message with link to file

---

## Database Schema

### MongoDB Collection: `oauth_tokens`

typescript
{
 id: ObjectId,
 service: "googledrive",           // For future extensibility
 userId: "admin",                   // Single user for now
 refreshToken: string,              // Google OAuth refresh token
 accessToken: string,               // Cached access token
 accessTokenExpiry: Date,           // When access token expires
 scopes: string[],                  // OAuth scopes granted
 createdAt: Date,
 updatedAt: Date
}

---

## API Design

### Netlify Functions

#### 1. `/api/google-oauth-init`
**Method:** GET  
**Auth:** Requires auth_token cookie  
**Purpose:** Initiate OAuth flow

**Response:**
typescript
{
 authUrl: string  // Google OAuth consent URL
}

#### 2. `/api/google-oauth-callback`
**Method:** GET  
**Query Params:** `code`, `state`  
**Purpose:** Handle OAuth callback, exchange code for tokens

**Flow:**
- Exchange authorization code for tokens
- Store refresh_token in MongoDB
- Redirect to `/admin/job-agent?oauth=success`

#### 3. `/api/google-drive-status`
**Method:** GET  
**Auth:** Requires auth_token cookie  
**Purpose:** Check if Google Drive is connected

**Response:**
typescript
{
 connected: boolean,
 email?: string  // Google account email if connected
}

#### 4. `/api/google-drive-upload`
**Method:** POST  
**Auth:** Requires auth_token cookie  
**Purpose:** Upload file(s) to Google Drive

**Request Body:**
typescript
{
 files: Array<{
   content: string,      // Markdown content
   type: "resume" | "cover-letter" | "job-description",
   folderId: string,     // Target folder ID
   jobTitle: string,     // For filename
   companyName: string   // For filename
 }>
}

**Response:**
typescript
{
 success: boolean,
 uploads: Array<{
   type: string,
   fileId: string,
   fileName: string,
   webViewLink: string
 }>,
 errors?: Array<{
   type: string,
   message: string
 }>
}

---

## Configuration

### Portfolio Site Constants

**File:** `src/lib/constants/google-drive-folders.ts`

typescript
export const GOOGLE_DRIVE_FOLDERS = [
 { id: "folder-id-1", name: "Personal Applications" },
 { id: "folder-id-2", name: "Client A" },
 { id: "folder-id-3", name: "Client B" },
 { id: "folder-id-4", name: "Consulting Projects" },
 { id: "folder-id-5", name: "Full-Time Roles" },
 { id: "folder-id-6", name: "Contract Work" },
 { id: "folder-id-7", name: "Archive" },
 { id: "folder-id-8", name: "Templates" },
] as const;

### Environment Variables

**Portfolio Site (.env):**
bash
# Existing vars...
GOOGLE_OAUTH_CLIENT_ID=your-client-id
GOOGLE_OAUTH_CLIENT_SECRET=your-client-secret
GOOGLE_OAUTH_REDIRECT_URI=https://clintonlangosch.com/api/google-oauth-callback

**API (no changes needed)**

---

## UI Design

### Component Structure


JobAgentPage.tsx (existing)
├── ResumeGenerator (modified)
│   ├── Generated resume display
│   ├── GoogleDriveFolderSelector (new)
│   └── Button: "Upload Resume to Drive" (new)
│
├── CoverLetterGenerator (modified)
│   ├── Generated cover letter display
│   ├── GoogleDriveFolderSelector (new)
│   └── Button: "Upload Cover Letter to Drive" (new)
│
└── Complete Step (modified)
   ├── Success message
   ├── GoogleDriveBatchUpload (new)
   │   ├── Job Description folder selector
   │   ├── Resume folder selector (pre-filled if already selected)
   │   ├── Cover Letter folder selector (pre-filled if already selected)
   │   └── Button: "Upload All to Drive"
   │
   └── GoogleDriveConnectionStatus (new)
       └── Button: "Connect Google Drive" (if not connected)

### New Components

**1. GoogleDriveConnectionStatus**
- Shows connection status
- "Connect Google Drive" button if not connected
- "Connected as [email]" if connected

**2. GoogleDriveFolderSelector**
- Dropdown with folder names from constants
- Props: `value`, `onChange`, `label`

**3. GoogleDriveBatchUpload**
- Three folder selectors (resume, cover letter, job description)
- "Upload All to Drive" button
- Success/error messages with file links

---

## File Naming Convention

Pattern: `YYYY-MM-DD-FILE-TYPE-JOB-TITLE-COMPANY.md`

Examples:
- `2026-01-24-resume-technical-writer-new-relic.md`
- `2026-01-24-cover-letter-technical-writer-new-relic.md`
- `2026-01-24-job-description-technical-writer-new-relic.md`

Rules:
- Date: Upload date (not generation date)
- Job title and company: Slugified (lowercase, hyphens, no special chars)
- Extension: Always `.md`

---

## Implementation Plan

### Research Phase

Before implementation, we need to research:

1. **Google Drive API v3 Documentation**
   - Files.create endpoint for uploading
   - OAuth 2.0 scopes required (drive.file vs drive)
   - Rate limits and quotas

2. **googleapis npm package**
   - Authentication patterns
   - File upload methods
   - Token refresh handling

3. **Netlify Functions**
   - Environment variable access
   - MongoDB connection from Netlify functions
   - Redirect handling in functions

**Research Questions:**
- What additional topics should be researched?
- Any specific resources (files, websites, tools) you recommend?
- Areas where you have existing knowledge to contribute?

---

## Task Breakdown

### Task 1: Setup Google Cloud Project & OAuth Credentials
**Objective:** Configure Google Cloud project with Drive API and OAuth credentials

**Implementation:**
- Create/configure Google Cloud project
- Enable Google Drive API
- Create OAuth 2.0 credentials (Web application)
- Add authorized redirect URI: `https://clintonlangosch.com/api/google-oauth-callback`
- Note client ID and secret for environment variables

**Test:** Verify credentials are created and redirect URI is whitelisted

**Demo:** Google Cloud Console shows configured OAuth client with correct redirect URI

---

### Task 2: Create MongoDB oauth_tokens Collection & Schema
**Objective:** Add database support for storing OAuth tokens

**Implementation:**
- Define TypeScript interface for oauth_tokens document
- Create repository functions in `api-career-data/src/services/mongodb.ts`:
  - `getOAuthToken(service, userId)`
  - `upsertOAuthToken(tokenData)`
- Add index on `{service: 1, userId: 1}` (unique)

**Test:** Verify repository functions can store and retrieve token documents

**Demo:** Can manually insert and query oauth_tokens in MongoDB

---

### Task 3: Create Google Drive Folders Constants
**Objective:** Define folder mapping configuration

**Implementation:**
- Create `portfolio-site/src/lib/constants/google-drive-folders.ts`
- Export `GOOGLE_DRIVE_FOLDERS` array with 8 folder entries
- Add TypeScript types for folder structure

**Test:** Import constants in a test file, verify structure

**Demo:** Constants file exists with proper TypeScript types

---

### Task 4: Implement OAuth Init Netlify Function
**Objective:** Create endpoint to initiate OAuth flow

**Implementation:**
- Create `portfolio-site/netlify/functions/google-oauth-init.ts`
- Validate auth_token cookie
- Generate OAuth URL using googleapis
- Return auth URL to client

**Test:** Call endpoint, verify it returns valid Google OAuth URL

**Demo:** Clicking "Connect" opens Google consent screen

---

### Task 5: Implement OAuth Callback Netlify Function
**Objective:** Handle OAuth callback and store tokens

**Implementation:**
- Create `portfolio-site/netlify/functions/google-oauth-callback.ts`
- Exchange authorization code for tokens
- Connect to MongoDB
- Store refresh_token using repository function from Task 2
- Redirect to `/admin/job-agent?oauth=success`

**Test:** Complete OAuth flow, verify token stored in MongoDB

**Demo:** After authorizing, redirected back to Job Agent with success message

---

### Task 6: Implement Drive Status Netlify Function
**Objective:** Check if Google Drive is connected

**Implementation:**
- Create `portfolio-site/netlify/functions/google-drive-status.ts`
- Validate auth_token cookie
- Query MongoDB for oauth_tokens
- Return connection status and email if connected

**Test:** Call endpoint before and after OAuth, verify correct status

**Demo:** UI shows "Not Connected" before OAuth, "Connected as [email]" after

---

### Task 7: Implement Drive Upload Netlify Function
**Objective:** Upload markdown files to Google Drive

**Implementation:**
- Create `portfolio-site/netlify/functions/google-drive-upload.ts`
- Validate auth_token cookie
- Retrieve and refresh access token if needed
- Generate filename using date, type, job title, company
- Upload each file to specified folder using googleapis
- Return file IDs and web view links

**Test:** Upload test markdown file, verify appears in Google Drive

**Demo:** Can upload file and receive link to view in Drive

---

### Task 8: Create GoogleDriveConnectionStatus Component
**Objective:** UI component to show connection status and initiate OAuth

**Implementation:**
- Create `portfolio-site/src/components/admin/google-drive/GoogleDriveConnectionStatus.tsx`
- Fetch status from `/api/google-drive-status`
- Show "Connect Google Drive" button if not connected
- Show "Connected as [email]" if connected
- Handle OAuth initiation on button click

**Test:** Render component, verify status display and OAuth flow

**Demo:** Component shows correct status and initiates OAuth when clicked

---

### Task 9: Create GoogleDriveFolderSelector Component
**Objective:** Reusable dropdown for folder selection

**Implementation:**
- Create `portfolio-site/src/components/admin/google-drive/GoogleDriveFolderSelector.tsx`
- Import GOOGLE_DRIVE_FOLDERS constants
- Render dropdown with folder names
- Props: `value`, `onChange`, `label`, `disabled`

**Test:** Render component, verify all folders appear and selection works

**Demo:** Dropdown shows 8 folders and updates on selection

---

### Task 10: Add Upload UI to ResumeGenerator
**Objective:** Enable individual resume upload

**Implementation:**
- Modify `portfolio-site/src/components/admin/job-agent/ResumeGenerator.tsx`
- Add GoogleDriveFolderSelector below resume display
- Add "Upload Resume to Drive" button
- Call `/api/google-drive-upload` with resume content
- Show success message with file link

**Test:** Generate resume, select folder, upload, verify success

**Demo:** Can upload resume and see link to file in Drive

---

### Task 11: Add Upload UI to CoverLetterGenerator
**Objective:** Enable individual cover letter upload

**Implementation:**
- Modify `portfolio-site/src/components/admin/job-agent/CoverLetterGenerator.tsx`
- Add GoogleDriveFolderSelector below cover letter display
- Add "Upload Cover Letter to Drive" button
- Call `/api/google-drive-upload` with cover letter content
- Show success message with file link

**Test:** Generate cover letter, select folder, upload, verify success

**Demo:** Can upload cover letter and see link to file in Drive

---

### Task 12: Create GoogleDriveBatchUpload Component
**Objective:** Enable uploading all three files at once

**Implementation:**
- Create `portfolio-site/src/components/admin/google-drive/GoogleDriveBatchUpload.tsx`
- Three GoogleDriveFolderSelector components (resume, cover letter, job description)
- "Upload All to Drive" button
- Call `/api/google-drive-upload` with all three files
- Display success/error for each file with links

**Test:** Upload all three files to different folders, verify all succeed

**Demo:** Can upload all files at once and see three links

---

### Task 13: Integrate Batch Upload into Complete Step
**Objective:** Wire batch upload into Job Agent workflow

**Implementation:**
- Modify `portfolio-site/src/components/admin/pages/JobAgentPage.tsx`
- Add GoogleDriveConnectionStatus to Complete step
- Add GoogleDriveBatchUpload to Complete step
- Pass resume, cover letter, job description content as props
- Handle success/error states

**Test:** Complete full workflow, upload all files from Complete step

**Demo:** Full end-to-end workflow with batch upload working

---

### Task 14: Add Error Handling & User Feedback
**Objective:** Robust error handling and clear user feedback

**Implementation:**
- Add error boundaries to upload components
- Handle network errors, API errors, quota errors
- Display user-friendly error messages
- Add loading states to all upload buttons
- Add retry logic for transient failures

**Test:** Test error scenarios (network failure, invalid token, quota exceeded)

**Demo:** Errors display clearly and don't break UI

---

### Task 15: Add Environment Variables & Documentation
**Objective:** Document setup and configuration

**Implementation:**
- Update `portfolio-site/.env.example` with Google OAuth vars
- Add setup instructions to portfolio-site README
- Document folder ID configuration process
- Add troubleshooting guide

**Test:** Follow documentation to set up from scratch

**Demo:** Documentation is complete and accurate

---

## Success Criteria

1. ✅ User can authorize Google Drive access via OAuth
2. ✅ User can upload resume individually from Resume page
3. ✅ User can upload cover letter individually from Cover Letter page
4. ✅ User can upload all three files at once from Complete page
5. ✅ Each file can be uploaded to a different folder
6. ✅ Files appear in Google Drive with correct naming convention
7. ✅ Upload completes within 10 seconds
8. ✅ Clear error messages displayed for any failures
9. ✅ OAuth tokens refresh automatically without user intervention
10. ✅ Feature works in production environment

---

## Dependencies

### NPM Packages (portfolio-site)
- `googleapis` - Google APIs Node.js client
- `mongodb` - MongoDB driver (if not already in Netlify functions)

### External Services
- Google Cloud Platform (OAuth credentials)
- Google Drive API v3
- MongoDB Atlas (oauth_tokens collection)

---

## Security Considerations

- OAuth tokens stored in MongoDB (not in code or logs)
- All endpoints require auth_token cookie validation
- Client ID/secret in environment variables only
- No tokens exposed to client-side JavaScript
- Use minimal OAuth scopes (drive.file preferred over drive)
- Implement token refresh before expiry

---

## Future Enhancements

- Support for additional file formats (PDF conversion)
- Folder management UI (add/remove folders without code changes)
- Upload history tracking
- Automatic backup of all generated documents
- Multi-user support with per-user OAuth tokens
