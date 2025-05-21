# MosqueConnect Deployment Guide

## Netlify Deployment Instructions

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

| Variable | Description |
|----------|-------------|
| `DATABASE_URI` | MongoDB connection string |
| `NEXTAUTH_SECRET` | Secret key for NextAuth.js authentication |
| `NEXTAUTH_URL` | Your Netlify site URL (e.g., https://muslimconnect.netlify.app) |
| `GOOGLE_MAPS_API_KEY` | Google Maps API key |
| `SKIP_TYPESCRIPT_CHECK` | Set to "true" |
| `NEXT_IGNORE_ESLINT` | Set to "1" |

**Important Security Note:** Never commit actual values of environment variables to your repository. The values should be set only in the Netlify dashboard or in local .env files that are not committed.

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

For any issues, check the logs in the Netlify dashboard and browser console.
