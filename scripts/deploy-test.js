// Deployment testing script
// This helps test if the application builds correctly with the current configuration

const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Print a header
console.log(`${colors.cyan}=== MosqueConnect Deployment Test ===\n${colors.reset}`);
console.log(`${colors.yellow}Running pre-deployment checks...${colors.reset}`);

// Check for required environment variables
const requiredEnvVars = [
  'NEXTAUTH_URL',
  'NEXTAUTH_SECRET',
  'DATABASE_URI'
];

// Check .env files
const checkEnvFiles = () => {
  const envFiles = [
    '.env.local',
    '.env.production',
    '.env'
  ];

  let foundVars = new Set();
  let missingVars = new Set(requiredEnvVars);

  envFiles.forEach(file => {
    try {
      const envPath = path.join(process.cwd(), file);
      if (fs.existsSync(envPath)) {
        console.log(`${colors.green}✓${colors.reset} Found ${file}`);

        const content = fs.readFileSync(envPath, 'utf8');
        requiredEnvVars.forEach(envVar => {
          if (content.includes(`${envVar}=`) && !foundVars.has(envVar)) {
            foundVars.add(envVar);
            missingVars.delete(envVar);
          }
        });
      }
    } catch (error) {
      console.log(`${colors.red}✗${colors.reset} Error reading ${file}: ${error.message}`);
    }
  });

  // Check process.env as well
  requiredEnvVars.forEach(envVar => {
    if (process.env[envVar] && !foundVars.has(envVar)) {
      foundVars.add(envVar);
      missingVars.delete(envVar);
    }
  });

  // Report on missing variables
  if (missingVars.size > 0) {
    console.log(`${colors.red}✗${colors.reset} Missing environment variables: ${Array.from(missingVars).join(', ')}`);
    console.log(`${colors.yellow}Please add these to .env.local or .env.production before deploying${colors.reset}`);
  } else {
    console.log(`${colors.green}✓${colors.reset} All required environment variables found`);
  }

  return missingVars.size === 0;
};

// Run build process
const runBuild = () => {
  return new Promise((resolve) => {
    console.log(`\n${colors.yellow}Building Next.js application...${colors.reset}`);

    const buildProcess = exec('npm run build', { cwd: process.cwd() });

    buildProcess.stdout.on('data', (data) => {
      process.stdout.write(data);
    });

    buildProcess.stderr.on('data', (data) => {
      process.stderr.write(data);
    });

    buildProcess.on('close', (code) => {
      if (code === 0) {
        console.log(`${colors.green}✓${colors.reset} Build completed successfully`);
        resolve(true);
      } else {
        console.log(`${colors.red}✗${colors.reset} Build failed with exit code ${code}`);
        resolve(false);
      }
    });
  });
};

// Run checks
const main = async () => {
  const envCheck = checkEnvFiles();

  if (!envCheck) {
    console.log(`\n${colors.yellow}Warning: Some environment variables are missing, but continuing anyway${colors.reset}`);
  }

  const buildSuccess = await runBuild();

  if (buildSuccess) {
    console.log(`\n${colors.green}====================================${colors.reset}`);
    console.log(`${colors.green}Deployment test completed successfully!${colors.reset}`);
    console.log(`${colors.green}Your application should deploy correctly.${colors.reset}`);
    console.log(`${colors.green}====================================${colors.reset}`);
  } else {
    console.log(`\n${colors.red}====================================${colors.reset}`);
    console.log(`${colors.red}Deployment test failed!${colors.reset}`);
    console.log(`${colors.red}Please fix the build errors before deploying.${colors.reset}`);
    console.log(`${colors.red}====================================${colors.reset}`);
  }
};

// Run the main function
main().catch(error => {
  console.error(`${colors.red}Error during deployment test:${colors.reset}`, error);
  process.exit(1);
});
