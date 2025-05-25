import CredentialsProvider from 'next-auth/providers/credentials';
import connectDB from '@/lib/db';
import { compare } from 'bcryptjs';
import UserModel from '@/models/User';

// Add this logging to help debug NEXTAUTH_URL issues
if (process.env.NODE_ENV === 'development') {
  console.log('NextAuth Environment:', {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'Not set',
    NODE_ENV: process.env.NODE_ENV,
    VERCEL_URL: process.env.VERCEL_URL || 'Not set',
  });
}

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Connect to the database
          await connectDB();

          // Find the user in the database
          const user = await UserModel.findOne({ email: credentials.email });

          // If no user is found, return null
          if (!user) {
            // For MVP purposes, if we don't have any users in the database yet,
            // we'll allow a demo login
            if (credentials.email === 'demo@example.com' && credentials.password === 'password') {
              return {
                id: '1',
                name: 'Demo User',
                email: 'demo@example.com',
                role: 'user',
              };
            }
            return null;
          }

          // Verify password
          const isValid = await compare(credentials.password, user.password);

          // If password is invalid, return null
          if (!isValid) {
            return null;
          }

          // Return user object
          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  // Use NEXTAUTH_URL from environment or dynamically determine it
  // The NEXTAUTH_URL is critical for callback URLs
  // If not set, it will try to use VERCEL_URL in production or localhost in development
  ...(process.env.NEXTAUTH_URL ? {} : {
    url: {
      origin: process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : process.env.NODE_ENV === 'development'
          ? 'http://localhost:3000'
          : undefined,
    },
  }),
  secret: process.env.NEXTAUTH_SECRET || 'a-temporary-secret-for-development',
};

export default authOptions;
