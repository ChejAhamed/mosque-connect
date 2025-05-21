import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from './auth';

// Server-side auth utilities
export async function getSession() {
  return await getServerSession(authOptions);
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

// Client-side authentication check
export function isAuthenticated(session) {
  return !!session?.user;
}

export function hasRole(session, allowedRoles) {
  if (!session?.user) return false;
  return allowedRoles.includes(session.user.role);
}

export function isAdmin(session) {
  return hasRole(session, ['admin']);
}

export function isImam(session) {
  return hasRole(session, ['imam', 'admin']);
}

export function isBusiness(session) {
  return hasRole(session, ['business', 'admin']);
}

export function isUser(session) {
  return hasRole(session, ['user', 'admin']);
}

// Keeping this for backward compatibility, but it's now an alias for isUser
export function isVolunteer(session) {
  return hasRole(session, ['volunteer', 'user', 'admin']);
}
