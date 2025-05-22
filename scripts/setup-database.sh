#!/bin/bash

# Text formatting
BOLD='\033[1m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BOLD}${BLUE}=== MosqueConnect Database Setup ===${NC}"
echo -e "${YELLOW}This script will seed your database with example mosque data.${NC}"
echo

# Check if MongoDB connection string is set
if [ -z "$DATABASE_URI" ] && [ -z "$MONGODB_URI" ]; then
  if [ -f .env.local ]; then
    echo -e "${YELLOW}Loading environment variables from .env.local${NC}"
    export $(grep -v '^#' .env.local | xargs)
  else
    echo -e "${YELLOW}No .env.local file found. Using default MongoDB connection.${NC}"
  fi
fi

echo -e "${BOLD}Step 1:${NC} Seeding mosque data..."
bun run seed:mosques

# Check if the seeding was successful
if [ $? -eq 0 ]; then
  echo -e "\n${GREEN}✓ Database setup completed successfully!${NC}"
  echo -e "${BOLD}Next steps:${NC}"
  echo -e "1. Start the development server with: ${YELLOW}bun run dev${NC}"
  echo -e "2. Visit http://localhost:3000/mosques to see the mosque data with map"
else
  echo -e "\n${YELLOW}⚠ There were some issues with the database setup.${NC}"
  echo -e "Please check the error messages above and ensure your MongoDB connection is properly configured."
fi

echo
echo -e "${BLUE}Thank you for using MosqueConnect!${NC}"
