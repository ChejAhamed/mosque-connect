import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

// For static export compatibility
export const dynamic = 'force-static';
export const revalidate = 3600; // Revalidate every hour

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
