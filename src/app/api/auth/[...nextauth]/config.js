import CredentialsProvider from 'next-auth/providers/credentials';
import { connectToDatabase } from '@/lib/db';
import { compare } from 'bcryptjs';
import UserModel from '@/models/User';

/**
 * NextAuth configuration with improved debugging and error handling
 */
export const authConfig = {
  debug: process.env.NODE_ENV === 'development',
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log('Missing credentials');
          return null;
        }

        try {
          // Connect to the database
          const dbConnection = await connectToDatabase();

          // Check if there was a connection error
          if (dbConnection.error) {
            console.error('Database connection error:', dbConnection.message);
            return null;
          }

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
          // Return null instead of throwing to prevent API route errors
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
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
  secret: process.env.NEXTAUTH_SECRET || 'a-temporary-secret-for-development',
};

export default authConfig;
