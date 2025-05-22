'use client';

import { useSession } from 'next-auth/react';

// Server-side role checking functions
export const isAuthenticated = (session) => !!session?.user;

export const isAdmin = (session) => {
  return session?.user?.role === 'admin';
};

export const isImam = (session) => {
  return session?.user?.role === 'imam';
};

export const isBusiness = (session) => {
  return session?.user?.role === 'business';
};

export const isVolunteer = (session) => {
  return session?.user?.role === 'volunteer';
};

// Client-side hooks for role checking
export const useAuth = () => {
  const { data: session, status } = useSession();
  const loading = status === 'loading';
  const isLoggedIn = isAuthenticated(session);

  return {
    session,
    status,
    loading,
    isLoggedIn,
    isAdmin: isAdmin(session),
    isImam: isImam(session),
    isBusiness: isBusiness(session),
    isVolunteer: isVolunteer(session),
    user: session?.user || null,
    userRole: session?.user?.role || 'user',
  };
};

// Redirect URLs based on role
export const getRedirectUrl = (session) => {
  if (!session?.user) return '/login';

  const role = session.user.role;

  switch (role) {
    case 'admin':
      return '/admin/dashboard';
    case 'imam':
      return '/dashboard/imam';
    case 'business':
      return '/dashboard/business';
    case 'volunteer':
      return '/dashboard/volunteer';
    default:
      return '/profile';
  }
};

// Common utility for getting user's display name initials
export const getInitials = (name) => {
  if (!name) return 'U';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();
};
