/**
 * Vercel Deployment Test Script
 *
 * This script tests key URLs to make sure your Vercel deployment is working properly
 * It checks NextAuth endpoints and API routes to identify any issues
 */

const baseUrl = process.env.NEXTAUTH_URL || 'https://mosque-connect-okkg-577kvixfe-chejahameds-projects.vercel.app';

async function testEndpoint(path, expectedStatus = 200, description) {
  const url = new URL(path, baseUrl).toString();
  console.log(`Testing ${description}:`);
  console.log(`URL: ${url}`);

  try {
    const response = await fetch(url);
    console.log(`Status: ${response.status} ${response.statusText}`);

    if (response.status === expectedStatus) {
      console.log('✅ SUCCESS');
    } else {
      console.log('❌ FAILED - Wrong status code');
      try {
        const text = await response.text();
        console.log('Response body (first 500 chars):');
        console.log(text.slice(0, 500) + (text.length > 500 ? '...' : ''));
      } catch (error) {
        console.log('Could not read response body');
      }
    }
  } catch (error) {
    console.log('❌ FAILED - Request error:');
    console.log(error.message);
  }

  console.log('-----------------------------------');
}

async function runTests() {
  console.log('=================================================');
  console.log('MOSQUE CONNECT VERCEL DEPLOYMENT TEST');
  console.log(`Base URL: ${baseUrl}`);
  console.log('=================================================');

  // Test homepage
  await testEndpoint('/', 200, 'Homepage');

  // Test NextAuth endpoints
  await testEndpoint('/api/auth/session', 200, 'NextAuth Session API');
  await testEndpoint('/api/auth/csrf', 200, 'NextAuth CSRF API');

  // Test API routes
  await testEndpoint('/api/mosques', 200, 'Mosques API');
  await testEndpoint('/api/prayer-times', 200, 'Prayer Times API');

  // Test pages
  await testEndpoint('/mosques', 200, 'Mosques Page');
  await testEndpoint('/businesses', 200, 'Businesses Page');

  console.log('=================================================');
  console.log('TEST COMPLETE');
  console.log('=================================================');
}

runTests().catch(error => {
  console.error('Test script error:', error);
  process.exit(1);
});
