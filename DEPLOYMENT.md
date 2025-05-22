# MosqueConnect Deployment Guide

This guide explains how to deploy MosqueConnect to different platforms, with special focus on Vercel deployment.

## Deploy to Vercel (Recommended)

Vercel provides the best support for Next.js applications, including server-side rendering and API routes.

### Prerequisites

1. A [GitHub](https://github.com) account with your project pushed to a repository
2. A [Vercel](https://vercel.com) account
3. A [MongoDB Atlas](https://www.mongodb.com/atlas) account with a database set up

### Deployment Steps

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Select the branch you want to deploy (e.g., `main` or `vercel-dynamic-deployment`)
5. Configure the following settings:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (or wherever your `package.json` is located)
   - **Build Command**: `next build`
   - **Output Directory**: `.next` (this is the default)
   - **Install Command**: `bun install` (or `npm install` if preferred)

6. Add the following environment variables in the Vercel dashboard under Project Settings > Environment Variables:

   | Key                   | Value                                 |
   |-----------------------|---------------------------------------|
   | `DATABASE_URI`        | Your MongoDB connection string        |
   | `NEXTAUTH_SECRET`     | A secure random string                |
   | `NEXTAUTH_URL`        | The URL of your Vercel deployment     |
   | `GOOGLE_MAPS_API_KEY` | Your Google Maps API key              |
   | `SKIP_TYPESCRIPT_CHECK` | `true`                              |
   | `NEXT_IGNORE_ESLINT`  | `true`                               |

   **Important Security Note:** Never commit actual values of environment variables to your repository. The values should be set only in the Vercel dashboard or in local `.env` files that are not committed.

7. Click "Deploy"

### Fixing Deployment Issues

If you encounter issues with NextAuth or MongoDB connections, try the following:

1. Make sure your `DATABASE_URI` is correct and your MongoDB Atlas cluster allows connections from Vercel (add Vercel's IPs or allow access from anywhere for testing).
2. Ensure `NEXTAUTH_URL` is set to your Vercel deployment URL, not localhost.
3. Check that your MongoDB user has the correct permissions.
4. Verify that no API routes have `export const dynamic = "force-static"` lines if you need dynamic server-side functionality.

For a more detailed troubleshooting guide, see [VERCEL_SETUP.md](./VERCEL_SETUP.md).

## Netlify Deployment Instructions

Netlify is also supported, but Vercel is recommended for best Next.js compatibility.

### Pre-requisites
- GitHub repository with your MosqueConnect project
- Netlify account
- MongoDB database (already configured)

### Step 1: Connect to Netlify
1. Log in to your Netlify account
2. Click "Add new site" > "Import an existing project"
3. Connect to GitHub and select your MosqueConnect repository

### Step 2: Configure Build Settings
Use the following settings in the Netlify UI:
- **Build command:** `bun run build`
- **Publish directory:** `.next`
- **Advanced build settings:** Click to expand this section

### Step 3: Add Environment Variables
Add the following environment variables in the Netlify site dashboard under Site settings > Environment variables:

| Variable               | Description                                 |
|------------------------|---------------------------------------------|
| `DATABASE_URI`         | MongoDB connection string                   |
| `NEXTAUTH_SECRET`      | Secret key for NextAuth.js authentication   |
| `NEXTAUTH_URL`         | Your Netlify site URL (e.g., https://muslimconnect.netlify.app) |
| `GOOGLE_MAPS_API_KEY`  | Google Maps API key                         |
| `SKIP_TYPESCRIPT_CHECK`| Set to "true"                               |
| `NEXT_IGNORE_ESLINT`   | Set to "1"                                  |

**Important Security Note:** Never commit actual values of environment variables to your repository. The values should be set only in the Netlify dashboard or in local `.env` files that are not committed.

### Step 4: Deploy
Click the "Deploy site" button to start the deployment process.

### Step 5: Set up Custom Domain (Optional)
1. Go to Domain Management in your site settings
2. Click "Add custom domain"
3. Follow the instructions to set up your domain

### Troubleshooting

If you encounter build errors:

1. **Missing Dependencies**: Try adding `@netlify/plugin-nextjs` as a dependency:
   ```bash
   bun add -D @netlify/plugin-nextjs
   ```

2. **Build Failures**: Check Netlify logs and make sure all environment variables are set correctly

3. **Runtime Errors**:
   - Verify that NEXTAUTH_URL matches your actual deployed URL
   - Check if the database connection is working
   - Examine browser console for any JavaScript errors

For runtime errors with the Select component:
- Ensure Select.Item components never have empty string values
- Use "all" or another non-empty string as the default value
- Check filtering logic to handle these default values correctly

### Post-Deployment Verification

After successful deployment, verify:
1. Home page loads correctly
2. Authentication works (sign in/sign up)
3. Business and event filters work properly
4. MongoDB connection is functioning

For any issues, check the logs in the Netlify or Vercel dashboard and browser console.

## Local Development

To run the project locally for development:

```bash
# Install dependencies
bun install

# Start the development server
bun run dev
```

Or use our automated deployment simulation:

```bash
node scripts/deploy.js
```

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Database Configuration
DATABASE_URI=mongodb+srv://user:password@cluster.mongodb.net/database

# API Keys
GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# Build Options (optional)
SKIP_TYPESCRIPT_CHECK=true
NEXT_IGNORE_ESLINT=true
```

## Production Configuration

For production deployment, set these environment variables in your hosting platform rather than in .env files.
