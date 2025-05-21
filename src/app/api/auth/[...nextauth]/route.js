import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

// NextAuth needs to run on the server, so we don't use static export config
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
