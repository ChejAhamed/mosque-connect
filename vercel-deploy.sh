#!/bin/bash

# Vercel Deployment Script for MosqueConnect
# This script helps deploy the dynamic version of MosqueConnect to Vercel

echo "========================================"
echo "🕌 MosqueConnect Vercel Deployment Helper"
echo "========================================"

# Make sure we're in the right directory
cd "$(dirname "$0")"

# Step 1: Check if we're on the right branch
BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$BRANCH" != "vercel-dynamic-deployment" ]; then
  echo "⚠️ WARNING: You are not on the 'vercel-dynamic-deployment' branch."
  echo "Current branch: $BRANCH"
  read -p "Do you want to switch to vercel-dynamic-deployment branch? (y/n): " SWITCH
  if [ "$SWITCH" == "y" ]; then
    git checkout vercel-dynamic-deployment || { echo "❌ Failed to switch branches"; exit 1; }
    echo "✅ Switched to vercel-dynamic-deployment branch"
  else
    echo "⚠️ Continuing with current branch: $BRANCH"
  fi
else
  echo "✅ Already on vercel-dynamic-deployment branch"
fi

# Step 2: Check for next.config.js settings
if grep -q "output: 'export'" next.config.js; then
  echo "❌ ERROR: next.config.js still contains 'output: export'"
  echo "Please remove this setting before deploying to Vercel"
  exit 1
else
  echo "✅ next.config.js looks good for dynamic deployment"
fi

# Step 3: Check package.json
if ! grep -q "\"build\": \"next build\"" package.json; then
  echo "❌ ERROR: package.json build script not set correctly"
  echo "Please ensure it contains: \"build\": \"next build\""
  exit 1
else
  echo "✅ package.json build script is configured correctly"
fi

# Step 4: Make sure all changes are committed
if [ -n "$(git status --porcelain)" ]; then
  echo "⚠️ You have uncommitted changes:"
  git status --short
  read -p "Do you want to commit these changes before deploying? (y/n): " COMMIT
  if [ "$COMMIT" == "y" ]; then
    read -p "Enter commit message: " COMMIT_MSG
    git add .
    git commit -m "$COMMIT_MSG"
    echo "✅ Changes committed"
  else
    echo "⚠️ Continuing with uncommitted changes"
  fi
else
  echo "✅ No uncommitted changes"
fi

# Step 5: Push to GitHub if needed
read -p "Push changes to GitHub? (y/n): " PUSH
if [ "$PUSH" == "y" ]; then
  git push -u origin "$BRANCH"
  echo "✅ Changes pushed to GitHub"
fi

# Step 6: Deployment instructions
echo ""
echo "========================================"
echo "🚀 DEPLOYMENT STEPS:"
echo "========================================"
echo "1. Go to https://vercel.com/dashboard"
echo "2. Create a new project or select your existing MosqueConnect project"
echo "3. Make sure to select the 'vercel-dynamic-deployment' branch"
echo "4. Add the following environment variables:"
echo "   - DATABASE_URI"
echo "   - NEXTAUTH_SECRET"
echo "   - NEXTAUTH_URL"
echo "   - GOOGLE_MAPS_API_KEY (if using maps)"
echo "5. Click Deploy"
echo ""
echo "See DEPLOYMENT-VERCEL.md for detailed instructions"
echo "========================================"

read -p "Do you want to open the Vercel dashboard now? (y/n): " OPEN
if [ "$OPEN" == "y" ]; then
  if command -v xdg-open &> /dev/null; then
    xdg-open "https://vercel.com/dashboard"
  elif command -v open &> /dev/null; then
    open "https://vercel.com/dashboard"
  else
    echo "Please visit https://vercel.com/dashboard in your browser"
  fi
fi

echo "✅ Done! Thanks for using MosqueConnect!"
