import CredentialsProvider from 'next-auth/providers/credentials';
import { connectDB } from '@/lib/db';
import { compare } from 'bcryptjs';
import User from '@/models/User';

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
          const user = await User.findOne({ email: credentials.email });

          // If no user is found, return null
          if (!user) {
            return null;
          }

          // Verify password
          const isValid = await compare(credentials.password, user.password);

          // If password is invalid, return null
          if (!isValid) {
            return null;
          }

          // Return user object with role
          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role || 'user', // Ensure role is included
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
      // Include role in JWT token
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.name = user.name;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      // Include role in session
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.name = token.name;
        session.user.email = token.email;
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

export default authOptions;