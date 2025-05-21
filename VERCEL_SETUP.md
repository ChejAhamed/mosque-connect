# MosqueConnect: Vercel Deployment Guide

This guide helps troubleshoot and fix deployment issues with MosqueConnect on Vercel, focusing on common problems with NextAuth, MongoDB connections, and API routes.

## Current Issues

If you're seeing these symptoms:
- Vercel login page redirects (instead of your site)
- API 500 errors in browser console
- NextAuth "Unexpected token '<', \<!DOCTYPE \"... is not valid JSON" errors
- MongoDB connection failures

## Step 1: Reset Your Deployment

The fastest solution is to clear your current deployment and start fresh:

1. Go to **Vercel Dashboard** → **MosqueConnect project** → **Settings** → **Advanced**
2. Scroll down to "Delete Project" and click "Delete"
3. Go to the [new project page](https://vercel.com/new)
4. Re-import your GitHub repo, selecting the `vercel-dynamic-deployment` branch
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

**❗ Important:** For `NEXTAUTH_URL`, use your actual Vercel deployment URL (not localhost)

## Step 3: Deploy Settings

Use these deployment settings:

- **Build Command**: `next build`
- **Output Directory**: `.next` (default)
- **Install Command**: `bun install` (or `npm install` if you prefer)
- **Framework Preset**: Next.js
- **Node.js Version**: 18.x

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

### If APIs return 500 errors:
- Check MongoDB connection string in environment variables
- Verify database user credentials
- Enable MongoDB network access to allow Vercel IPs

### If NextAuth errors occur:
- Make sure `NEXTAUTH_URL` is set correctly
- Check that `NEXTAUTH_SECRET` is properly formatted
- Ensure your API routes don't have `export const dynamic = "force-static"` lines

### If deployment shows Vercel login page:
- Your authentication might be failing at a project level
- Try a complete redeployment with fresh GitHub import
- Check the Vercel team settings to make sure your account has access

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
