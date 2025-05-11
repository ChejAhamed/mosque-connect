# MosqueConnect Deployment Guide

## Environment Variables for Netlify

When deploying to Netlify, you need to set up the following environment variables in the Netlify dashboard:

1. Go to your Netlify site dashboard
2. Navigate to Site settings > Environment variables
3. Add the following environment variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URI` | MongoDB connection string | `mongodb+srv://username:password@cluster.mongodb.net/database` |
| `NEXTAUTH_SECRET` | Secret key for NextAuth.js authentication | A random string used to encrypt tokens |
| `NEXTAUTH_URL` | Full URL of your Netlify site | `https://your-site-name.netlify.app` |
| `GOOGLE_MAPS_API_KEY` | Google Maps API key (if used) | Your Google API key |

## Important Security Notes

1. Never commit sensitive information directly to your repository.
2. Environment variables set in the Netlify dashboard are securely encrypted.
3. For local development, use `.env.local` which is already in `.gitignore`.
4. Different environments (development, production) can have different environment variables.

## Build Settings

The build settings are already configured in `netlify.toml`:

- Node version: 18
- Build command: `rm -rf .next && NODE_OPTIONS=--max_old_space_size=4096 bun run netlify-build`
- Publish directory: `.next`

## Troubleshooting

If you encounter build errors:

1. Check the build logs in the Netlify dashboard
2. Ensure all environment variables are correctly set
3. Verify that all dependencies are properly installed

For runtime errors:

1. Check browser console for JavaScript errors
2. Verify MongoDB connection is working properly
3. Make sure the API routes are functioning as expected
