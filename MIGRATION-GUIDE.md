# GraphQL Proxy Removal - Migration Guide

## Overview

The Netlify GraphQL proxy has been removed and replaced with direct API key-based access to the GraphQL API. This eliminates timeout issues for long-running operations (especially job agent requests) and simplifies the architecture.

## What Changed

### Removed
- `netlify/functions/graphql-proxy.js` - No longer needed
- Cookie-to-header translation for GraphQL requests
- Proxy endpoint at `/.netlify/functions/graphql-proxy`

### Updated
- `src/lib/graphql-client.ts` - Now uses direct API access with read/write keys
- `.env.example` - New environment variable structure
- Documentation files (AGENTS.md, CLAUDE.md, auth-flow-diagram.md)

### New Architecture
- **Public pages**: Direct GraphQL access with read-only API key
- **Admin pages**: Direct GraphQL access with write API key
- **Security**: Admin pages still protected by cookie-based JWT auth via middleware

## Required Actions

### 1. Update GraphQL API Service

The GraphQL API (in the `api-career-data` repository) needs to be updated to support API key-based authentication with read/write keys:

#### Changes Needed:
1. **Add API Key Validation**: Update `src/middleware/auth.ts` to:
   - Accept two types of API keys: read-only and write keys
   - Read-only key: Allows queries only
   - Write key: Allows queries and mutations
   - Validate key from `X-API-Key` header

2. **Environment Variables**: Add to GraphQL API:
   ```bash
   API_READ_KEY=<read-only-key>   # For public queries
   API_WRITE_KEY=<write-key>       # For admin mutations
   ```

3. **Validation Logic**:
   ```javascript
   // Pseudocode for auth middleware
   function validateApiKey(req) {
     const apiKey = req.headers['x-api-key'];
     const isWrite = isMutationRequest(req.body);
     
     if (isWrite) {
       // Mutations require write key
       return apiKey === process.env.API_WRITE_KEY;
     } else {
       // Queries can use either key
       return apiKey === process.env.API_READ_KEY || 
              apiKey === process.env.API_WRITE_KEY;
     }
   }
   ```

### 2. Configure Environment Variables

Update your Netlify environment variables:

```bash
# GraphQL API endpoint (public)
PUBLIC_GRAPHQL_ENDPOINT=https://your-graphql-api.com/graphql

# Read-only API key (public, safe to expose, queries only)
PUBLIC_GRAPHQL_READ_KEY=your-read-only-key-here

# Write API key (protected by admin auth, allows mutations)
PUBLIC_GRAPHQL_WRITE_KEY=your-write-key-here

# Legacy env vars (optional, for backwards compatibility with scripts)
GRAPHQL_ENDPOINT=${PUBLIC_GRAPHQL_ENDPOINT}
GRAPHQL_API_KEY=${PUBLIC_GRAPHQL_WRITE_KEY}

# Existing auth vars (no changes)
AUTH_SECRET=your-existing-secret
ADMIN_USERNAME=your-existing-username
ADMIN_PASSWORD_HASH=your-existing-hash
ANTHROPIC_API_KEY=your-existing-key
```

**Important**: 
- The `PUBLIC_` prefix makes variables accessible in client-side code
- Read-only key is safe to expose (queries only)
- Write key is also exposed but protected by admin middleware
- Both keys should be different from each other

### 3. Generate API Keys

Create secure API keys for both read and write access:

```bash
# Generate read-only key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate write key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Deploy Changes

1. **Portfolio Site**:
   - Push the changes (already done via this PR)
   - Configure environment variables in Netlify
   - Deploy

2. **GraphQL API**:
   - Implement API key validation
   - Configure API_READ_KEY and API_WRITE_KEY
   - Deploy

### 5. Testing Checklist

Once deployed, verify:

- [ ] **Public Pages** (unauthenticated)
  - [ ] Skills page loads and displays data
  - [ ] Projects page loads and displays data
  - [ ] Experience page loads and displays data
  - [ ] No console errors about missing API keys

- [ ] **Admin Pages** (authenticated)
  - [ ] Login works (unchanged)
  - [ ] Can view list of skills/projects/experiences
  - [ ] Can create new items
  - [ ] Can edit existing items
  - [ ] Can delete items
  - [ ] No console errors

- [ ] **Job Agent** (the critical fix)
  - [ ] Can generate resume (check for timeout - should not happen)
  - [ ] Can generate cover letter (check for timeout - should not happen)
  - [ ] Long-running operations complete successfully

## Security Model

### Before (Proxy Architecture)
1. Browser → Netlify proxy function
2. Proxy extracts cookie, adds to Authorization header
3. Proxy → GraphQL API

**Issue**: Netlify functions have strict timeout limits (10 seconds for free tier, 26 seconds for paid)

### After (Direct Access)
1. Browser → GraphQL API (with API key in header)

**Security**:
- Public pages: Read-only key (queries only, safe to expose)
- Admin pages: Write key (mutations allowed, but access controlled by middleware)
- Admin middleware still validates JWT cookie before rendering admin pages
- Write key is only loaded on authenticated admin pages

## Troubleshooting

### "PUBLIC_GRAPHQL_READ_KEY not set" Warning
- Set the environment variable in Netlify
- Restart the Netlify Dev server if testing locally

### "Failed to fetch" Errors
- Check that PUBLIC_GRAPHQL_ENDPOINT is correct
- Verify GraphQL API is running and accessible
- Check browser console for CORS errors

### CORS Errors
- GraphQL API must allow requests from your domain
- Update CORS headers in GraphQL API if needed

### 401 Unauthorized Errors
- Verify API keys match between portfolio and GraphQL API
- Check that GraphQL API is validating keys correctly
- Ensure read-only key is used for queries, write key for mutations

### Admin Pages Not Loading
- Cookie auth is unchanged - check middleware logs
- Verify auth_token cookie is being set on login
- Check auth-verify function is working

## Rollback Plan

If issues occur, you can temporarily rollback:

1. Restore `netlify/functions/graphql-proxy.js` from git history
2. Revert `src/lib/graphql-client.ts` to use proxy endpoint
3. Restore old environment variables (GRAPHQL_ENDPOINT, GRAPHQL_API_KEY)
4. Redeploy

Note: The proxy function code is preserved in git history at commit hash before this PR.

## Benefits

✅ **No more timeouts**: Direct API access eliminates Netlify function timeout issues
✅ **Simpler architecture**: One less component (no proxy function)
✅ **Better performance**: Fewer network hops, faster responses
✅ **Easier debugging**: Direct request/response flow visible in browser DevTools
✅ **Cost reduction**: No Netlify function invocations for GraphQL requests

## Questions?

Refer to the updated documentation:
- `docs/auth-flow-diagram.md` - Complete authentication flow
- `AGENTS.md` - Architecture overview
- `.env.example` - Environment variable reference
