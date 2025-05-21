import NextAuth from 'next-auth';
import authConfig from './config';

// NextAuth needs to run on the server
const handler = NextAuth(authConfig);

export { handler as GET, handler as POST };
