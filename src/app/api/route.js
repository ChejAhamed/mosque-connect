import { NextResponse } from 'next/server';

// Helper function to handle CORS
function setCorsHeaders(response) {
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT,HEAD');
  response.headers.set('Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
  return response;
}

// OPTIONS handler for CORS preflight
export async function OPTIONS() {
  return setCorsHeaders(NextResponse.json({ success: true }));
}

// GET handler for API health check
export async function GET() {
  return setCorsHeaders(NextResponse.json({
    status: 'ok',
    message: 'API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  }));
}

// HEAD handler for CORS and monitoring
export async function HEAD() {
  return setCorsHeaders(NextResponse.json({}));
}

// Error handler for general API errors
export function error(err) {
  console.error('API Error:', err);
  return setCorsHeaders(NextResponse.json({
    error: true,
    message: 'Internal Server Error'
  }, { status: 500 }));
}
