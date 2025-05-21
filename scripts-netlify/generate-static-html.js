/**
 * This script generates a static HTML landing page for Netlify deployment
 * to avoid issues with Next.js static export
 */

const fs = require('fs');
const path = require('path');

// Path to the output directory
const outputDir = path.join(__dirname, '..', 'public-static');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Generate the landing page HTML
const landingPageHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MosqueConnect - Connecting Communities</title>
  <link rel="icon" href="/favicon.ico" />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
    }

    body {
      background-color: #f9fafb;
      color: #1f2937;
      line-height: 1.6;
    }

    header {
      background-color: #10b981;
      color: white;
      padding: 1.5rem;
      text-align: center;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem 1rem;
    }

    .card {
      background-color: white;
      border-radius: 0.5rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      padding: 2rem;
      margin-bottom: 2rem;
    }

    h1 {
      font-size: 2.5rem;
      margin-bottom: 1rem;
    }

    h2 {
      font-size: 1.5rem;
      margin-bottom: 1rem;
      color: #10b981;
    }

    p {
      margin-bottom: 1rem;
    }

    ul {
      margin-left: 2rem;
      margin-bottom: 1.5rem;
    }

    li {
      margin-bottom: 0.5rem;
    }

    .alert {
      background-color: #fff7ed;
      border-left: 4px solid #f97316;
      padding: 1rem;
      margin-bottom: 1.5rem;
    }

    .note {
      font-size: 0.875rem;
      color: #4b5563;
      font-style: italic;
    }

    footer {
      background-color: #e5e7eb;
      padding: 1.5rem;
      text-align: center;
      margin-top: 2rem;
    }

    .btn {
      display: inline-block;
      background-color: #10b981;
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 0.25rem;
      text-decoration: none;
      font-weight: 500;
      transition: background-color 0.2s;
    }

    .btn:hover {
      background-color: #059669;
    }

    .features {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.5rem;
      margin: 2rem 0;
    }

    .feature-card {
      background-color: white;
      border-radius: 0.5rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      padding: 1.5rem;
      border-top: 3px solid #10b981;
    }

    .feature-title {
      font-size: 1.25rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
      color: #1f2937;
    }

    @media (max-width: 768px) {
      h1 {
        font-size: 2rem;
      }

      .features {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>
<body>
  <header>
    <h1>MosqueConnect</h1>
    <p>Connecting Muslim Communities</p>
  </header>

  <div class="container">
    <div class="card">
      <h2>Welcome to MosqueConnect</h2>
      <p>MosqueConnect is a platform designed to connect Muslim communities with local mosques, businesses, and events. Our goal is to strengthen community bonds and make it easier to find Islamic resources and services.</p>

      <div class="alert">
        <strong>Important Notice:</strong> This is a static landing page for our application. The full interactive application is currently in development.
      </div>

      <h3>Bug Fixes and Deployment Updates</h3>
      <p>We've recently addressed several issues to improve the application:</p>
      <ul>
        <li>Fixed the Select component empty string value errors</li>
        <li>Updated dropdown functionality to properly handle "all" filter values</li>
        <li>Configured the app for static deployment</li>
        <li>Improved environment variable management</li>
        <li>Updated dependency configurations</li>
      </ul>

      <p class="note">For the full application experience, please check back soon or contact the administrator.</p>
    </div>

    <h2>Features</h2>
    <div class="features">
      <div class="feature-card">
        <div class="feature-title">Mosque Directory</div>
        <p>Find mosques near you, view prayer times, and connect with the community.</p>
      </div>

      <div class="feature-card">
        <div class="feature-title">Business Listings</div>
        <p>Discover Muslim-owned businesses and halal services in your area.</p>
      </div>

      <div class="feature-card">
        <div class="feature-title">Community Events</div>
        <p>Stay updated on local Islamic events, classes, and gatherings.</p>
      </div>

      <div class="feature-card">
        <div class="feature-title">Islamic Resources</div>
        <p>Access hadith, Islamic articles, and educational materials.</p>
      </div>

      <div class="feature-card">
        <div class="feature-title">Prayer Times</div>
        <p>Get accurate prayer times for your location.</p>
      </div>

      <div class="feature-card">
        <div class="feature-title">Community Announcements</div>
        <p>Important community updates and announcements from local organizations.</p>
      </div>
    </div>
  </div>

  <footer>
    <p>&copy; ${new Date().getFullYear()} MosqueConnect. All rights reserved.</p>
    <p>For questions, please contact support@mosqueconnect.com</p>
  </footer>
</body>
</html>
`;

// Write the index.html file
fs.writeFileSync(path.join(outputDir, 'index.html'), landingPageHTML);

// Write a 404.html file (same as index.html for SPA-like behavior)
fs.writeFileSync(path.join(outputDir, '404.html'), landingPageHTML);

console.log('Static HTML landing page generated successfully!');

// Create the API directory and mock JSON response
const apiDir = path.join(outputDir, 'api');
if (!fs.existsSync(apiDir)) {
  fs.mkdirSync(apiDir, { recursive: true });
}

// Create a mock API response
const mockApiResponse = {
  success: false,
  message: "API routes are not available in this static deployment",
  note: "This is a placeholder response for API routes in the static deployment. For a full interactive experience, please use the dynamic deployment."
};

fs.writeFileSync(path.join(apiDir, 'mock.json'), JSON.stringify(mockApiResponse, null, 2));
console.log('Mock API response created successfully!');

// Add a logo image if available
try {
  // Check if the logo exists in the public directory or in the project root
  const logoSources = [
    path.join(__dirname, '..', 'public', 'muslim-connect-logo.svg'),
    path.join(__dirname, '..', 'public', 'logo.svg'),
    path.join(__dirname, '..', 'muslim-connect-logo.svg')
  ];

  let logoFound = false;

  for (const logoPath of logoSources) {
    if (fs.existsSync(logoPath)) {
      fs.copyFileSync(logoPath, path.join(outputDir, path.basename(logoPath)));
      console.log(`Logo copied successfully from ${logoPath}!`);
      logoFound = true;
      break;
    }
  }

  if (!logoFound) {
    console.log('No logo file found to copy.');
  }
} catch (error) {
  console.error('Error copying logo:', error);
}
