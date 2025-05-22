#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== MosqueConnect Fixes Application Script ===${NC}"
echo -e "${YELLOW}This script applies the v82 fixes to fix JavaScript syntax errors and NextAuth issues${NC}\n"

# Check if we're in a git repository
if ! git rev-parse --is-inside-work-tree &> /dev/null; then
  echo -e "${RED}Error: This script must be run from inside a git repository.${NC}"
  exit 1
fi

# Make sure we have the bundle file
BUNDLE_FILE="mosque-connect-fixes-v82.bundle"
if [ ! -f "$BUNDLE_FILE" ]; then
  echo -e "${RED}Error: Could not find the bundle file: $BUNDLE_FILE${NC}"
  echo -e "${YELLOW}Please make sure the bundle file is in the current directory.${NC}"
  exit 1
fi

# Verify the bundle
echo -e "${BLUE}Verifying bundle file...${NC}"
if ! git bundle verify "$BUNDLE_FILE" &> /dev/null; then
  echo -e "${RED}Error: The bundle file is invalid or corrupted.${NC}"
  exit 1
fi
echo -e "${GREEN}Bundle verification successful!${NC}"

# Create a backup branch
CURRENT_BRANCH=$(git symbolic-ref --short HEAD)
BACKUP_BRANCH="${CURRENT_BRANCH}-backup-$(date +%Y%m%d-%H%M%S)"
echo -e "${BLUE}Creating backup branch: $BACKUP_BRANCH${NC}"
git branch "$BACKUP_BRANCH"
echo -e "${GREEN}Backup created successfully!${NC}"

# Create a new branch for the fixes
FIXES_BRANCH="fixes-v82"
echo -e "${BLUE}Creating new branch for fixes: $FIXES_BRANCH${NC}"
git checkout -b "$FIXES_BRANCH"

# Extract the bundle
echo -e "${BLUE}Extracting changes from bundle...${NC}"
git bundle unbundle "$BUNDLE_FILE"

# Find the latest commit in the bundle
LATEST_COMMIT=$(git log --format="%H" -n 1 FETCH_HEAD)
echo -e "${BLUE}Found latest commit: ${LATEST_COMMIT:0:8}...${NC}"

# Cherry-pick the key fixes
echo -e "${BLUE}Applying key fixes from the bundle...${NC}"

# Check for UI component fixes
if git show FETCH_HEAD:src/components/ui/select.tsx &> /dev/null; then
  echo -e "${YELLOW}Applying UI component fixes...${NC}"
  mkdir -p src/components/ui
  git show FETCH_HEAD:src/components/ui/select.tsx > src/components/ui/select.tsx
  git add src/components/ui/select.tsx
  echo -e "${GREEN}UI component fixes applied!${NC}"
fi

# Check for NextAuth fixes
if git show FETCH_HEAD:src/app/api/auth/[...nextauth]/route.js &> /dev/null; then
  echo -e "${YELLOW}Applying NextAuth fixes...${NC}"
  mkdir -p src/app/api/auth/[...nextauth]
  git show FETCH_HEAD:src/app/api/auth/[...nextauth]/route.js > src/app/api/auth/[...nextauth]/route.js
  git show FETCH_HEAD:src/app/api/auth/[...nextauth]/config.js > src/app/api/auth/[...nextauth]/config.js
  git add src/app/api/auth/[...nextauth]
  echo -e "${GREEN}NextAuth fixes applied!${NC}"
fi

# Check for CORS middleware fixes
if git show FETCH_HEAD:middleware.js &> /dev/null; then
  echo -e "${YELLOW}Applying CORS middleware fixes...${NC}"
  git show FETCH_HEAD:middleware.js > middleware.js
  git add middleware.js
  echo -e "${GREEN}CORS middleware fixes applied!${NC}"
fi

# Check for API health fixes
if git show FETCH_HEAD:src/app/api/route.js &> /dev/null; then
  echo -e "${YELLOW}Applying API health checks...${NC}"
  mkdir -p src/app/api
  git show FETCH_HEAD:src/app/api/route.js > src/app/api/route.js
  git add src/app/api/route.js
  echo -e "${GREEN}API health checks applied!${NC}"
fi

# Copy favicon if needed
if git show FETCH_HEAD:public/favicon.ico &> /dev/null; then
  echo -e "${YELLOW}Adding favicon...${NC}"
  mkdir -p public
  git show FETCH_HEAD:public/favicon.ico > public/favicon.ico
  git add public/favicon.ico
  echo -e "${GREEN}Favicon added!${NC}"
fi

# Copy the documentation
if git show FETCH_HEAD:FIXES-v82.md &> /dev/null; then
  echo -e "${YELLOW}Adding documentation...${NC}"
  git show FETCH_HEAD:FIXES-v82.md > FIXES-v82.md
  git show FETCH_HEAD:VERCEL_SETUP.md > VERCEL_SETUP.md
  git add FIXES-v82.md VERCEL_SETUP.md
  echo -e "${GREEN}Documentation added!${NC}"
fi

# Copy helpful scripts
if git show FETCH_HEAD:scripts/deploy-test.js &> /dev/null; then
  echo -e "${YELLOW}Adding helper scripts...${NC}"
  mkdir -p scripts
  git show FETCH_HEAD:scripts/deploy-test.js > scripts/deploy-test.js
  git show FETCH_HEAD:scripts/github-push.sh > scripts/github-push.sh
  chmod +x scripts/github-push.sh
  git add scripts/deploy-test.js scripts/github-push.sh
  echo -e "${GREEN}Helper scripts added!${NC}"
fi

# Commit the changes
echo -e "${BLUE}Committing fixes...${NC}"
git commit -m "Apply v82 fixes for JavaScript syntax errors, NextAuth issues, and CORS"

# Summary
echo -e "\n${GREEN}====================================${NC}"
echo -e "${GREEN}Fixes applied successfully!${NC}"
echo -e "${BLUE}You are now on branch: ${FIXES_BRANCH}${NC}"
echo -e "${BLUE}Your original branch ${CURRENT_BRANCH} was backed up to: ${BACKUP_BRANCH}${NC}"
echo -e "${YELLOW}Next steps:${NC}"
echo -e "1. Review the changes with 'git diff ${BACKUP_BRANCH}'"
echo -e "2. Push to GitHub with 'git push origin ${FIXES_BRANCH}'"
echo -e "3. Deploy to Vercel (see VERCEL_SETUP.md for details)"
echo -e "${GREEN}====================================${NC}"
