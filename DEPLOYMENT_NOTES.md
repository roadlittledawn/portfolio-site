# Deployment Notes: GraphQL Authorization Fix

## Summary
This deployment fixes the issue where GraphQL mutations were failing with "Authorization header required for mutations" after authentication was moved from localStorage to HTTP-only cookies.

## What Changed

### New GraphQL Proxy Function
A new Netlify function (`netlify/functions/graphql-proxy.js`) has been added to handle GraphQL requests. This function:
- Extracts JWT tokens from HTTP-only cookies on the server side
- Validates tokens before forwarding requests
- Adds the `Authorization: Bearer <token>` header to GraphQL API requests
- Provides proper CORS handling and security controls

### Updated GraphQL Client
The client-side GraphQL client now sends requests to the proxy function (`/.netlify/functions/graphql-proxy`) instead of directly to the GraphQL API.

## Required Environment Variables

### Production Deployment (Netlify Dashboard)
Add these environment variables in your Netlify dashboard:

```
GRAPHQL_ENDPOINT=https://your-graphql-api.com/graphql
GRAPHQL_API_KEY=your-api-key-here
AUTH_SECRET=your-64-char-hex-secret
ADMIN_USERNAME=your-admin-username
ADMIN_PASSWORD_HASH=your-bcrypt-hash
ANTHROPIC_API_KEY=your-anthropic-key (optional)
```

**Important**: 
- `GRAPHQL_ENDPOINT` is now **required** (server-side variable)
- `GRAPHQL_API_KEY` is now **required** (server-side variable)
- Do NOT use `PUBLIC_` prefixed variables for server-side configuration

### Local Development (.env file)
```
# Server-side (required for mutations)
GRAPHQL_ENDPOINT=http://localhost:8888/graphql
GRAPHQL_API_KEY=your-local-api-key

# Client-side (for static builds/sync scripts)
PUBLIC_GRAPHQL_ENDPOINT=http://localhost:8888/graphql
PUBLIC_API_KEY=your-local-api-key

# Auth
AUTH_SECRET=your-generated-secret
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=your-generated-hash

# AI (optional)
ANTHROPIC_API_KEY=your-key
```

## Testing Checklist

### After Deployment
1. **Login Test**
   - Navigate to `/admin/login`
   - Login with admin credentials
   - Verify successful authentication

2. **Mutation Tests** (for each admin section)
   - **Skills**: Create, update, and delete a skill
   - **Projects**: Create, update, and delete a project
   - **Experience**: Create, update, and delete an experience entry
   - **Education**: Create, update, and delete an education entry
   - **Profile**: Update profile information

3. **Query Tests**
   - Verify all list pages load correctly
   - Verify individual item detail pages load
   - Verify public site displays data correctly

### Expected Behavior
- ✅ All mutations should succeed with valid authentication
- ✅ Mutations should fail with 401/403 for unauthenticated users
- ✅ Public queries (read-only) should work without authentication
- ✅ No CORS errors in browser console

### Troubleshooting

#### "Server configuration error"
- **Cause**: `GRAPHQL_ENDPOINT` environment variable not set
- **Fix**: Add `GRAPHQL_ENDPOINT` to Netlify environment variables

#### "Forbidden" error in production
- **Cause**: Request origin not in allowed list
- **Fix**: Check that your domain matches `https://clintonlangosch.com` or add it to the allowed origins list in `graphql-proxy.js`

#### Mutations still failing with "Authorization header required"
- **Cause**: Cookie not being sent or JWT token invalid
- **Fix**: 
  1. Check browser cookies - should have `auth_token` cookie
  2. Try logging out and logging back in
  3. Check that `AUTH_SECRET` matches between login function and proxy

#### CORS errors
- **Cause**: Origin mismatch or credentials not included
- **Fix**: Verify `Access-Control-Allow-Origin` matches your domain

## Security Notes

### What's Secure
- ✅ JWT tokens stored in HTTP-only cookies (not accessible to JavaScript)
- ✅ Tokens validated server-side before use
- ✅ CORS restricted to specific allowed origins
- ✅ Server-side environment variables not exposed to client
- ✅ Production origin validation rejects non-allowed sources

### Security Best Practices Followed
1. No sensitive data exposed to client-side code
2. Token validation before forwarding requests
3. Proper CORS configuration with credentials
4. No error details leaked in production responses
5. Cookie parsing handles edge cases correctly

## Rollback Plan

If issues arise, you can rollback by:
1. Reverting the PR commits
2. Restoring previous `src/lib/graphql-client.ts` to use direct GraphQL endpoint
3. Removing the `graphql-proxy.js` function

However, this would revert to the broken state where mutations fail. The proper fix is to ensure environment variables are correctly configured.

## Migration Path

No database migrations or data changes required. This is purely a configuration and proxy layer change.

## Support

For issues or questions:
1. Check Netlify function logs for server-side errors
2. Check browser console for client-side errors
3. Verify all environment variables are set correctly
4. Test with browser DevTools Network tab to see request/response details
