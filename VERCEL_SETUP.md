# MosqueConnect: Vercel Deployment Guide

This guide helps troubleshoot and fix deployment issues with MosqueConnect on Vercel, focusing on common problems with NextAuth, MongoDB connections, API routes, and JavaScript syntax errors.

## Current Issues

If you're seeing these symptoms:
- Vercel login page redirects (instead of your site)
- API 500 errors in browser console
- NextAuth "Unexpected token '<', <!DOCTYPE \"... is not valid JSON" errors
- MongoDB connection failures
- JavaScript syntax errors in bundled files

## Step 1: Reset Your Deployment

The fastest solution is to clear your current deployment and start fresh:

1. Go to **Vercel Dashboard** → **MosqueConnect project** → **Settings** → **Advanced**
2. Scroll down to "Delete Project" and click "Delete"
3. Go to the [new project page](https://vercel.com/new)
4. Re-import your GitHub repo, selecting the `fixes-v82` branch
5. Configure project settings as shown below

## Step 2: Configure Environment Variables

In the project configuration screen, add these environment variables **exactly** as shown:

| Key | Value |
|-----|-------|
| `DATABASE_URI` | `mongodb+srv://rasd:Saif13saif@rasd2022.z69cu.mongodb.net/ummah` |
| `NEXTAUTH_SECRET` | `BN5HEdDod78pAFeOZD3P5fOx+GiVRaEO6fleXIMatXT65ngkAftFIRoVa04=` |
| `NEXTAUTH_URL` | `https://your-project-url.vercel.app` (replace with your actual Vercel URL) |
| `GOOGLE_MAPS_API_KEY` | `AIzaSyAodvbSqTiEDGD4Xgj7wAVOxI1jqkD0-Ik` |
| `SKIP_TYPESCRIPT_CHECK` | `true` |
| `NEXT_IGNORE_ESLINT` | `true` |

**❗ Important:** For `NEXTAUTH_URL`, use your actual Vercel deployment URL (not localhost).
For example: `https://mosque-connect-okkg-1npkc8ckf-chejahameds-projects.vercel.app`

## Step 3: Deploy Settings

Use these deployment settings:

- **Build Command**: `next build`
- **Output Directory**: `.next` (default)
- **Install Command**: `bun install` (or `npm install` if you prefer)
- **Framework Preset**: Next.js
- **Node.js Version**: 18.x

## Important Configuration Changes

We've made the following critical changes to fix deployment issues:

1. **Updated vercel.json**: Removed the `functions` and `rewrites` sections that were causing deployment errors with the App Router.
   - If you previously had a `vercel.json` file with custom `functions` or `rewrites`, please remove or update it to only include necessary configuration.
   - The recommended minimal `vercel.json` for MosqueConnect is either empty or omitted entirely, unless you have a specific use case.
   - This change ensures that Vercel's App Router and API routes work as expected without interference.

2. **Enhanced CORS Middleware**: Added comprehensive CORS support through middleware instead of relying on vercel.json functions.

3. **Fixed API Routes**: Made sure all API routes are properly configured for App Router.

4. **Added Authentication Improvements**: Enhanced NextAuth configuration with better error handling and fallbacks.

5. **Added Profile Page**: Created a role-based profile page at `/profile` with different functionality based on user role.

## Latest Features (v82.4)

### Role-Based Profile Page

We've added a new profile page at `/profile` that shows different content based on user role:

- **Admin**: Displays admin-specific controls and management options
- **Imam**: Shows mosque management features
- **Business**: Provides access to product and announcement management
- **Volunteer**: Shows volunteer opportunities and activities
- **Regular User**: Shows basic profile information

### Role Switching for Testing

The profile page includes a role switcher for testing purposes. This allows you to easily:

1. Log in with any account (including the demo account)
2. Go to your profile page
3. Use the role switcher to temporarily change your role for testing
4. Test different user interfaces and functionality

This makes it easy to verify the application works correctly for all user types without needing multiple accounts.

## Step 4: Verify MongoDB Access

Make sure your MongoDB Atlas cluster:
1. Has **Network Access** set to allow connections from anywhere (`0.0.0.0/0`)
2. Has a user with read/write access to your database
3. Is an active and running cluster

## Step 5: Check the Deployment

After deployment completes:

1. Visit your site at the Vercel URL
2. Check browser console for errors
3. Verify API routes are working (test `/api/mosques` endpoint)
4. Make sure authentication/login functions properly

## Troubleshooting Common Issues

### If NextAuth shows "Unexpected token '<'" errors:
- This usually means the API is returning HTML instead of JSON
- Make sure your NEXTAUTH_URL environment variable exactly matches your Vercel deployment URL
- Check that your code doesn't have any syntax errors
- Ensure your API routes don't have `export const dynamic = "force-static"` lines

### If JavaScript syntax errors appear:
- Look for missing parentheses or curly braces in React components
- Check component rendering in layout files
- Our latest commit fixed several syntax issues in UI components

### If APIs return 500 errors:
- Check MongoDB connection string in environment variables
- Verify database user credentials
- Enable MongoDB network access to allow Vercel IPs

### If favicon.ico 404 errors appear:
- We've added a favicon.ico to the public directory in the latest commit

## Testing Your APIs

To debug API issues, run the verification script:

```bash
cd mosque-connect
node scripts/vercel-deployment-test.js
```

This will test all critical API endpoints and report any issues.

## Additional Resources

- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)
- [Vercel Environment Variables Guide](https://vercel.com/docs/concepts/projects/environment-variables)
- [NextAuth.js Documentation](https://next-auth.js.org/getting-started/deployment)
- [MongoDB Atlas Connection Guide](https://www.mongodb.com/docs/atlas/tutorial/connect-to-your-cluster/)
