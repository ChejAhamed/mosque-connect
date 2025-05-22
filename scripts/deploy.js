#!/usr/bin/env node

/**
 * Simple deployment script for testing MosqueConnect locally
 * This simulates a Vercel deployment for immediate testing
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Configuration
const PORT = 3000;
const BUILD_COMMAND = 'bun run build';
const START_COMMAND = 'bun run start';

console.log('==================================================');
console.log('🕌 MosqueConnect Deployment Simulation');
console.log('==================================================');
console.log('This script simulates a Vercel deployment for testing.');
console.log('It will build and run the project locally on port 3000.');
console.log();

// Run the build process
console.log('📦 Building the project...');
exec(BUILD_COMMAND, { cwd: path.resolve(__dirname, '..') }, (error, stdout, stderr) => {
  if (error) {
    console.error('❌ Build failed:', error);
    console.error(stderr);
    return;
  }

  console.log(stdout);
  console.log('✅ Build complete!');

  // Start the server
  console.log('\n🚀 Starting the server...');
  const server = exec(START_COMMAND, { cwd: path.resolve(__dirname, '..') });

  server.stdout.on('data', (data) => {
    console.log(data.toString());
  });

  server.stderr.on('data', (data) => {
    console.error(data.toString());
  });

  console.log(`\n🔍 The app is now running at http://localhost:${PORT}`);
  console.log(`\n📋 Checking for environment variables...`);

  // Check for required environment variables
  const requiredVars = [
    'DATABASE_URI',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',
  ];

  const missingVars = [];
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  }

  if (missingVars.length > 0) {
    console.warn('\n⚠️ Warning: The following environment variables are missing:');
    missingVars.forEach(v => console.warn(`  - ${v}`));
    console.warn('\nThis may cause issues with MongoDB connection or authentication.');
    console.warn('Make sure to set these in your environment or .env.local file.');
  } else {
    console.log('✅ All required environment variables are set!');
  }

  console.log('\n==================================================');
  console.log('🎉 Deployment simulation complete!');
  console.log('   Access your site at: http://localhost:3000');
  console.log('   Press Ctrl+C to stop the server when finished');
  console.log('==================================================');
});
