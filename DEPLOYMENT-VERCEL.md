# MosqueConnect Vercel Deployment Guide

This guide walks you through deploying the full dynamic version of MosqueConnect on Vercel with MongoDB integration.

## Prerequisites

- GitHub account connected to Vercel
- MongoDB Atlas account with a database cluster set up
- Vercel account

## Step 1: Ensure You're Using the Dynamic Branch

Make sure your deployment uses the `vercel-dynamic-deployment` branch which contains all the necessary changes for a dynamic (non-static) deployment with:

- Working API routes
- MongoDB data connection
- Authentication
- Full functionality

## Step 2: Set Up Environment Variables

Before deploying, you need to set up the following environment variables in Vercel:

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URI` | Your MongoDB connection string | `mongodb+srv://username:password@cluster.mongodb.net/mosqueconnect?retryWrites=true&w=majority` |
| `NEXTAUTH_SECRET` | Secret key for NextAuth.js | A random string, e.g., `mysecretkey123` |
| `NEXTAUTH_URL` | The base URL of your application | `https://your-project.vercel.app` |
| `GOOGLE_MAPS_API_KEY` | Google Maps API Key (if using maps) | `AIza...` |
| `SKIP_TYPESCRIPT_CHECK` | If using TS with potential errors | `true` |
| `NODE_VERSION` | Set Node.js version if needed | `18.x` |

## Step 3: Deploy to Vercel

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Create New Project**:
   - Click "Add New" → "Project"
   - Import from your GitHub repository "mosque-connect"
3. **Configure Project**:
   - Select the "vercel-dynamic-deployment" branch
   - Framework Preset: Next.js
   - Root Directory: `./` (leave as default if your package.json is at the root)
   - Build Command: `next build` (default)
   - Output Directory: `.next` (default)
4. **Add Environment Variables**:
   - Add all environment variables from Step 2
5. **Deploy**:
   - Click "Deploy"

## Step 4: Verify Deployment

After deployment completes:

1. **Check for build success** in the deployment logs
2. **Visit your deployment URL** (e.g., https://mosque-connect.vercel.app)
3. **Test core functionality**:
   - Browse mosque listings
   - Check authentication
   - Verify business listings
   - Test registration

## Troubleshooting Common Issues

### Build Fails with Icon Import Errors

This means there might be missing imports in the dashboard. Check:
- That the icon imports use valid icons from lucide-react
- There are no references to removed icons (Mosque, Male, Female)

### API Routes Return 404

This indicates your app might still be configured for static export:
- Make sure `next.config.js` doesn't contain `output: 'export'`
- Ensure no API routes have `export const dynamic = "force-static"`

### MongoDB Connection Errors

If the site deploys but shows database errors:
- Verify your `DATABASE_URI` environment variable is correct
- Ensure your MongoDB Atlas cluster has the appropriate network access (IP whitelist)
- Check that your database user has the correct permissions

### Authentication Issues

If login/registration doesn't work:
- Verify `NEXTAUTH_URL` matches your deployment URL
- Ensure `NEXTAUTH_SECRET` is set correctly

## Redeploying After Changes

To redeploy after making changes:

1. Push your changes to the GitHub repository
2. Vercel will automatically trigger a new deployment
3. Monitor the build process in the Vercel dashboard

---

For further assistance, refer to the [Vercel Documentation](https://vercel.com/docs) or [Next.js Deployment Documentation](https://nextjs.org/docs/deployment).
