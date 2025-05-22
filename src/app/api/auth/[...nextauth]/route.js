import NextAuth from 'next-auth';
import authConfig from './config';

// NextAuth handler for App Router - simple and reliable
const handler = NextAuth(authConfig);

// Export the NextAuth handler for GET, POST and HEAD requests
export { handler as GET, handler as POST, handler as HEAD };
