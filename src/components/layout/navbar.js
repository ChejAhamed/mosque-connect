'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { isAuthenticated, isAdmin, isImam, isBusiness, isVolunteer } from '@/lib/auth-utils';

export function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const user = session?.user;
  const loading = status === 'loading';

  const isActive = (path) => {
    return pathname === path;
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <nav className="bg-white border-b border-gray-200 py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center space-x-8">
          <Link href="/" className="flex items-center space-x-2">
            <img src="/muslim-connect-logo.svg" alt="MosqueConnect Logo" className="h-10" />
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            <Link
              href="/"
              className={`text-sm ${
                isActive('/') ? 'text-green-600 font-medium' : 'text-gray-600 hover:text-green-600'
              }`}
            >
              Home
            </Link>
            <Link
              href="/mosques"
              className={`text-sm ${
                isActive('/mosques') ? 'text-green-600 font-medium' : 'text-gray-600 hover:text-green-600'
              }`}
            >
              Mosques
            </Link>
            <Link
              href="/volunteers"
              className={`text-sm ${
                isActive('/volunteers') ? 'text-green-600 font-medium' : 'text-gray-600 hover:text-green-600'
              }`}
            >
              Volunteers
            </Link>
            <Link
              href="/businesses"
              className={`text-sm ${
                isActive('/businesses') ? 'text-green-600 font-medium' : 'text-gray-600 hover:text-green-600'
              }`}
            >
              Businesses
            </Link>
            <Link
              href="/events"
              className={`text-sm ${
                isActive('/events') ? 'text-green-600 font-medium' : 'text-gray-600 hover:text-green-600'
              }`}
            >
              Events
            </Link>
            <Link
              href="/hadith"
              className={`text-sm ${
                isActive('/hadith') ? 'text-green-600 font-medium' : 'text-gray-600 hover:text-green-600'
              }`}
            >
              Hadith
            </Link>

            {/* Role-specific navigation items */}
            {isAuthenticated(session) && isBusiness(session) && (
              <Link
                href="/dashboard/business"
                className={`text-sm bg-green-100 px-3 py-1 rounded-full ${
                  isActive('/dashboard/business') ? 'text-green-700 font-medium' : 'text-green-600 hover:text-green-700'
                }`}
              >
                My Business
              </Link>
            )}

            {isAuthenticated(session) && isImam(session) && (
              <Link
                href="/dashboard/imam"
                className={`text-sm bg-blue-100 px-3 py-1 rounded-full ${
                  isActive('/dashboard/imam') ? 'text-blue-700 font-medium' : 'text-blue-600 hover:text-blue-700'
                }`}
              >
                My Mosque
              </Link>
            )}

            {isAuthenticated(session) && isAdmin(session) && (
              <Link
                href="/admin/dashboard"
                className={`text-sm bg-purple-100 px-3 py-1 rounded-full ${
                  isActive('/admin/dashboard') ? 'text-purple-700 font-medium' : 'text-purple-600 hover:text-purple-700'
                }`}
              >
                Admin
              </Link>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {!loading && !isAuthenticated(session) ? (
            <>
              <Link href="/login">
                <Button variant="outline" size="sm">
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Register</Button>
              </Link>
            </>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="" alt={user?.name || ''} />
                    <AvatarFallback>{user?.name ? getInitials(user.name) : 'U'}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground capitalize">
                      {user?.role}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                {isAdmin(session) && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/admin/dashboard">Admin Dashboard</Link>
                    </DropdownMenuItem>
                  </>
                )}

                {isImam(session) && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/imam">Imam Dashboard</Link>
                    </DropdownMenuItem>
                  </>
                )}

                {isVolunteer(session) && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/volunteer">Volunteer Dashboard</Link>
                    </DropdownMenuItem>
                  </>
                )}

                {isBusiness(session) && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/business">Business Dashboard</Link>
                    </DropdownMenuItem>
                  </>
                )}

                <DropdownMenuItem asChild>
                  <Link href="/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="text-red-600 cursor-pointer"
                >
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </nav>
  );
}
