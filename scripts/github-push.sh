#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== GitHub Push Helper ===${NC}"
echo -e "${YELLOW}This script helps push your code to GitHub${NC}\n"

# Check if repository URL is provided
if [ -z "$1" ]; then
  echo -e "${YELLOW}Please provide your GitHub repository URL as the first argument:${NC}"
  echo -e "${YELLOW}Example: bash github-push.sh https://github.com/username/repo-name.git${NC}"

  # Try to guess from existing remote
  REMOTE_URL=$(git config --get remote.origin.url)
  if [ ! -z "$REMOTE_URL" ]; then
    echo -e "${GREEN}Found existing remote URL: ${REMOTE_URL}${NC}"
    echo -e "${YELLOW}Do you want to use this URL? (y/n)${NC}"
    read -r USE_EXISTING

    if [[ $USE_EXISTING == "y" || $USE_EXISTING == "Y" ]]; then
      REPO_URL=$REMOTE_URL
    else
      echo -e "${RED}Exiting. Please run the script again with your repository URL.${NC}"
      exit 1
    fi
  else
    echo -e "${RED}Exiting. Please run the script again with your repository URL.${NC}"
    exit 1
  fi
else
  REPO_URL=$1
fi

# Check if git is installed
if ! command -v git &> /dev/null; then
  echo -e "${RED}Git is not installed. Please install git first.${NC}"
  exit 1
fi

# Check if we're in a git repository
if ! git rev-parse --is-inside-work-tree &> /dev/null; then
  echo -e "${RED}Not in a git repository. Please run this script from inside your project directory.${NC}"
  exit 1
fi

# Get current branch
CURRENT_BRANCH=$(git symbolic-ref --short HEAD)
echo -e "${GREEN}Current branch: ${CURRENT_BRANCH}${NC}"

# Add remote if needed
if ! git config --get remote.origin.url &> /dev/null; then
  echo -e "${YELLOW}Adding remote 'origin' with URL: ${REPO_URL}${NC}"
  git remote add origin "$REPO_URL"
else
  CURRENT_REMOTE=$(git config --get remote.origin.url)
  if [ "$CURRENT_REMOTE" != "$REPO_URL" ]; then
    echo -e "${YELLOW}Updating remote 'origin' from ${CURRENT_REMOTE} to ${REPO_URL}${NC}"
    git remote set-url origin "$REPO_URL"
  fi
fi

# Push to GitHub
echo -e "${YELLOW}Pushing branch '${CURRENT_BRANCH}' to GitHub...${NC}"
git push -u origin "$CURRENT_BRANCH"

# Check if push was successful
if [ $? -eq 0 ]; then
  echo -e "${GREEN}Successfully pushed to GitHub!${NC}"

  # Push tags
  echo -e "${YELLOW}Pushing tags to GitHub...${NC}"
  git push --tags

  echo -e "\n${GREEN}===================================${NC}"
  echo -e "${GREEN}Your code is now on GitHub!${NC}"
  echo -e "${GREEN}Repository URL: ${REPO_URL}${NC}"
  echo -e "${GREEN}Branch: ${CURRENT_BRANCH}${NC}"
  echo -e "${GREEN}===================================${NC}"
else
  echo -e "${RED}Failed to push to GitHub. Please check your credentials and repository URL.${NC}"
  echo -e "${YELLOW}You might need to create the repository on GitHub first if it doesn't exist.${NC}"
  echo -e "${YELLOW}Visit https://github.com/new to create a new repository.${NC}"
fi
