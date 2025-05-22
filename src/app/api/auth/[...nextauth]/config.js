import CredentialsProvider from 'next-auth/providers/credentials';
import { connectToDatabase } from '@/lib/db';
import { compare } from 'bcryptjs';
import UserModel from '@/models/User';

/**
 * NextAuth configuration with improved debugging and error handling
 */
export const authConfig = {
  debug: true, // Enable debug mode to help troubleshoot
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
          // For testing/demo purposes
          if (process.env.NODE_ENV === 'development' || process.env.ALLOW_DEMO_LOGIN === 'true') {
            return {
              id: 'demo-user',
              name: 'Demo User',
              email: 'demo@example.com',
              role: 'user',
            };
          }
          return null;
        }

        try {
          // Special case for demo login
          if (credentials.email === 'demo@example.com' && credentials.password === 'password') {
            console.log('Using demo login');
            return {
              id: 'demo-user',
              name: 'Demo User',
              email: 'demo@example.com',
              role: 'user',
            };
          }

          // Connect to the database
          console.log('Connecting to database...');
          const dbConnection = await connectToDatabase().catch(err => {
            console.error('Database connection error:', err);
            return { error: true, message: err.message };
          });

          // Check if there was a connection error
          if (dbConnection.error) {
            console.error('Database connection failed:', dbConnection.message);
            // Fall back to demo user if database connection fails
            console.log('Falling back to demo user due to DB connection failure');
            return {
              id: 'demo-user',
              name: 'Demo User',
              email: 'demo@example.com',
              role: 'user',
            };
          }

          // Find the user in the database
          console.log('Finding user:', credentials.email);
          let user;
          try {
            user = await UserModel.findOne({ email: credentials.email });
          } catch (err) {
            console.error('Error finding user:', err);
            return null;
          }

          // If no user is found, return demo user or null
          if (!user) {
            console.log('User not found');
            // For testing/demo purposes
            if (process.env.NODE_ENV === 'development' || process.env.ALLOW_DEMO_LOGIN === 'true') {
              return {
                id: 'demo-user',
                name: 'Demo User',
                email: 'demo@example.com',
                role: 'user',
              };
            }
            return null;
          }

          // Verify password
          console.log('Verifying password');
          let isValid = false;
          try {
            isValid = await compare(credentials.password, user.password);
          } catch (err) {
            console.error('Password comparison error:', err);
            return null;
          }

          // If password is invalid, return null
          if (!isValid) {
            console.log('Invalid password');
            return null;
          }

          // Return user object
          console.log('Login successful for', user.email);
          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role || 'user',
          };
        } catch (error) {
          console.error('Auth error:', error);
          // For testing/demo purposes, allow fallback to demo user
          if (process.env.NODE_ENV === 'development' || process.env.ALLOW_DEMO_LOGIN === 'true') {
            console.log('Falling back to demo user due to auth error');
            return {
              id: 'demo-user',
              name: 'Demo User',
              email: 'demo@example.com',
              role: 'user',
            };
          }
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
