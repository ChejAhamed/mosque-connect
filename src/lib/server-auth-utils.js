import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authConfig } from '../app/api/auth/[...nextauth]/config';

// Server-side auth utilities
export async function getSession() {
  return await getServerSession(authConfig);
}

export async function getCurrentUser() {
  const session = await getSession();
  return session?.user;
}

export async function requireAuth() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  return user;
}

export async function requireRole(allowedRoles) {
  const user = await requireAuth();

  if (!allowedRoles.includes(user.role)) {
    redirect('/unauthorized');
  }

  return user;
}

export async function requireAdmin() {
  return requireRole(['admin']);
}

export async function requireImam() {
  return requireRole(['imam', 'admin']);
}

export async function requireBusiness() {
  return requireRole(['business', 'admin']);
}

export async function requireVolunteer() {
  return requireRole(['volunteer', 'admin']);
}

// Server-side role checking functions
export const isAuthenticated = (session) => !!session?.user;

export const hasRole = (session, allowedRoles) => {
  if (!session?.user) return false;
  return allowedRoles.includes(session.user.role);
}

export const isAdmin = (session) => {
  return hasRole(session, ['admin']);
};

export const isImam = (session) => {
  return hasRole(session, ['imam', 'admin']);
};

export const isBusiness = (session) => {
  return hasRole(session, ['business', 'admin']);
};

export const isVolunteer = (session) => {
  return hasRole(session, ['volunteer', 'admin']);
};
