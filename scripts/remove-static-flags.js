const fs = require('fs');
const path = require('path');

// Root directory of API routes
const apiDir = path.join(process.cwd(), 'src', 'app', 'api');

// Function to recursively find all .js files in a directory
function findJsFiles(dir, filesList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      findJsFiles(filePath, filesList);
    } else if (file.endsWith('.js') || file.endsWith('.ts')) {
      filesList.push(filePath);
    }
  });

  return filesList;
}

// Function to remove static export flags from a file
function removeStaticFlags(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Check for static export flags
    if (content.includes("export const dynamic = 'force-static'") ||
        content.includes('export const dynamic = "force-static"')) {
      content = content.replace(/export const dynamic = ['"]force-static['"];?\n?/g, '');
      modified = true;
    }

    // Check for revalidate
    if (content.includes('export const revalidate =')) {
      content = content.replace(/export const revalidate = \d+;.*\n?/g, '');
      modified = true;
    }

    // Save the file if modified
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Removed static flags from: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error processing file ${filePath}:`, error);
  }
}

console.log('🔍 Finding API route files...');
const jsFiles = findJsFiles(apiDir);
console.log(`📂 Found ${jsFiles.length} files to check`);

// Process each file
jsFiles.forEach(file => {
  removeStaticFlags(file);
});

console.log('✅ Done! Static export flags have been removed from API routes.');
