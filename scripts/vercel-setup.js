#!/usr/bin/env node

/**
 * Vercel Deployment Setup Script
 *
 * This script prepares your project for Vercel deployment by:
 * 1. Checking for a vercel.json file
 * 2. Validating critical environment variables in .env.production
 * 3. Creating a deployment checklist
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT_DIR = path.resolve(__dirname, '..');
const ENV_PROD_PATH = path.join(ROOT_DIR, '.env.production');
const VERCEL_CONFIG_PATH = path.join(ROOT_DIR, 'vercel.json');

// ANSI color codes for terminal output
const RESET = '\x1b[0m';
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const CYAN = '\x1b[36m';

console.log(`${CYAN}==================================================`);
console.log('🕌 MosqueConnect Vercel Deployment Setup');
console.log(`==================================================${RESET}`);

// Check if vercel.json exists
console.log(`\n📄 Checking for vercel.json configuration...`);
if (fs.existsSync(VERCEL_CONFIG_PATH)) {
  console.log(`${GREEN}✅ vercel.json found!${RESET}`);

  try {
    const vercelConfig = JSON.parse(fs.readFileSync(VERCEL_CONFIG_PATH, 'utf8'));
    console.log(`   → Build command: ${vercelConfig.buildCommand || '(default)'}`);
    console.log(`   → Install command: ${vercelConfig.installCommand || '(default)'}`);
    console.log(`   → Framework: ${vercelConfig.framework || '(default)'}`);
  } catch (error) {
    console.error(`${RED}❌ Error parsing vercel.json: ${error.message}${RESET}`);
  }
} else {
  console.log(`${YELLOW}⚠️ vercel.json not found!${RESET}`);
  console.log(`   Consider creating one for optimal configuration.`);
}

// Check production environment variables
console.log(`\n🔐 Checking .env.production file...`);
if (fs.existsSync(ENV_PROD_PATH)) {
  console.log(`${GREEN}✅ .env.production found!${RESET}`);

  try {
    const envContent = fs.readFileSync(ENV_PROD_PATH, 'utf8');
    const envLines = envContent.split('\n');
    const envVars = {};

    envLines.forEach(line => {
      if (line.trim() && !line.startsWith('#')) {
        const [key, ...valueParts] = line.split('=');
        if (key) {
          const value = valueParts.join('=');
          envVars[key.trim()] = value.trim();
        }
      }
    });

    // Check critical environment variables
    const criticalVars = [
      'DATABASE_URI',
      'NEXTAUTH_SECRET',
      'NEXTAUTH_URL'
    ];

    criticalVars.forEach(varName => {
      if (envVars[varName]) {
        console.log(`   → ${varName}: ${GREEN}✅ Found${RESET}`);

        // Special check for NEXTAUTH_URL
        if (varName === 'NEXTAUTH_URL' &&
            (envVars[varName].includes('localhost') ||
             envVars[varName].includes('netlify'))) {
          console.log(`     ${YELLOW}⚠️ Warning: NEXTAUTH_URL should be your Vercel URL, not localhost or Netlify${RESET}`);
        }
      } else {
        console.log(`   → ${varName}: ${RED}❌ Missing${RESET}`);
      }
    });
  } catch (error) {
    console.error(`${RED}❌ Error reading .env.production: ${error.message}${RESET}`);
  }
} else {
  console.log(`${YELLOW}⚠️ .env.production not found!${RESET}`);
  console.log(`   Create one with DATABASE_URI, NEXTAUTH_SECRET, and NEXTAUTH_URL.`);
}

// Check for static export flags in API routes
console.log(`\n🔍 Checking API routes for static export flags...`);
const apiDir = path.join(ROOT_DIR, 'src', 'app', 'api');

if (fs.existsSync(apiDir)) {
  try {
    // Use grep to find static export flags
    const grepCommand = `grep -r "export const dynamic = \\"force-static\\"" ${apiDir} || echo "No static flags found"`;
    const grepResult = execSync(grepCommand, { encoding: 'utf8' });

    if (grepResult.includes('No static flags found')) {
      console.log(`${GREEN}✅ No static export flags found in API routes!${RESET}`);
    } else {
      console.log(`${RED}❌ Static export flags found in API routes:${RESET}`);
      console.log(grepResult);
      console.log(`${YELLOW}   These will prevent server-side rendering and API functionality.${RESET}`);
      console.log(`   Remove them for proper Vercel deployment.`);
    }
  } catch (error) {
    console.error(`${RED}❌ Error checking API routes: ${error.message}${RESET}`);
  }
} else {
  console.log(`${YELLOW}⚠️ API directory not found at src/app/api${RESET}`);
}

// Generate deployment checklist
console.log(`\n📋 ${CYAN}VERCEL DEPLOYMENT CHECKLIST:${RESET}`);
console.log(`
1. ${BLUE}Push your code to GitHub:${RESET}
   git push origin vercel-dynamic-deployment

2. ${BLUE}Go to Vercel and create a new project:${RESET}
   https://vercel.com/new

3. ${BLUE}Select your GitHub repository and configure:${RESET}
   - Branch: vercel-dynamic-deployment
   - Framework: Next.js
   - Build Command: next build
   - Install Command: bun install

4. ${BLUE}Add these environment variables:${RESET}
   - DATABASE_URI
   - NEXTAUTH_SECRET
   - NEXTAUTH_URL (set to your Vercel deployment URL)
   - GOOGLE_MAPS_API_KEY
   - SKIP_TYPESCRIPT_CHECK=true
   - NEXT_IGNORE_ESLINT=true

5. ${BLUE}Click Deploy and wait for completion${RESET}

6. ${BLUE}Test your site at the provided URL${RESET}
`);

console.log(`${CYAN}==================================================`);
console.log('🚀 You are now ready to deploy to Vercel!');
console.log(`==================================================${RESET}`);
