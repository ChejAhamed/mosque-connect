import { NextResponse } from 'next/server';

export function middleware(request) {
  // Get the pathname of the request
  const pathname = request.nextUrl.pathname;

  // Add CORS headers to API requests
  if (pathname.startsWith('/api/')) {
    // NextResponse.next() returns a response that allows the middleware to
    // continue to the next middleware or route handler
    const response = NextResponse.next();

    // Add the CORS headers to the response
    response.headers.append('Access-Control-Allow-Credentials', 'true');
    response.headers.append('Access-Control-Allow-Origin', '*');
    response.headers.append('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    response.headers.append(
      'Access-Control-Allow-Headers',
      'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    return response;
  }

  // Continue to next middleware/route handler for non-API requests
  return NextResponse.next();
}

// Configure which paths this middleware applies to
export const config = {
  matcher: [
    // Apply to all API routes
    '/api/:path*'
  ],
};
