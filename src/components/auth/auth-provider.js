'use client';

import { SessionProvider } from 'next-auth/react';
import { useEffect } from 'react';

export function AuthProvider({ children }) {
  // Log auth state for debugging purposes
  useEffect(() => {
    if (
      process.env.NODE_ENV === 'development' ||
      (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app'))
    ) {
      console.log('AuthProvider mounted - session will be available');
    }
  }, []);

  return (
    <SessionProvider refetchInterval={60} refetchOnWindowFocus={true}>
      {children}
    </SessionProvider>
  );
}
