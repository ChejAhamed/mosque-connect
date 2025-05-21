import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

// For static export compatibility
export const dynamic = 'force-static';
export const revalidate = 3600; // Revalidate every hour

// For static exports with catch-all routes
export function generateStaticParams() {
  return [
    { nextauth: ['session'] },
    { nextauth: ['signin'] },
    { nextauth: ['signout'] },
    { nextauth: ['callback'] },
    { nextauth: ['verify-request'] },
    { nextauth: ['error'] },
  ];
}

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
