"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Menu, X, User, Settings, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Track scroll position to change navbar style
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Create initials for avatar
  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Get display name from session
  const displayName = session?.user?.name || "User";
  const userInitials = getInitials(displayName);

  // Define main navigation links
  const navLinks = [
    { href: "/", label: "Home", showAlways: true },
    { href: "/mosques", label: "Mosques", showAlways: true },
    { href: "/businesses", label: "Businesses", showAlways: true },
    { href: "/events", label: "Events", showAlways: true },
    { href: "/volunteers", label: "Volunteers", showAlways: true },
    { href: "/hadith", label: "Hadith", showAlways: true },
  ];

  // Define dashboard links based on user role
  const getDashboardLink = () => {
    if (!session) return null;

    const role = session.user?.role;

    if (role === "admin") {
      return { href: "/admin/dashboard", label: "🔧 Admin Dashboard" };
    } else if (role === "imam") {
      return { href: "/dashboard/imam", label: "Imam Dashboard" };
    } else if (role === "business") {
      return { href: "/dashboard/business", label: "Business Dashboard" };
    } else {
      // Regular users get volunteer dashboard
      return { href: "/dashboard/volunteer", label: "Volunteer Dashboard" };
    }
  };

  // Get any special actions based on user role
  const getSpecialActions = () => {
    const role = session?.user?.role;
    const actions = [];

    if (role === "imam") {
      actions.push({ href: "/dashboard/imam", label: "Imam Dashboard", icon: Settings });
      
    }

    if (role === "admin") {
      actions.push({ href: "/admin/announcements", label: "Manage Announcements", icon: Settings });
      actions.push({ href: "/announcements", label: "Announcements", icon: Settings });
    //   actions.push({ href: "/admin/dashboard", label: "🔧 Admin Dashboard", icon: Settings });
    //   actions.push({ href: "/admin/mosques", label: "Manage Mosques", icon: Settings });
    //   actions.push({ href: "/admin/businesses", label: "Manage Businesses", icon: Settings });
    //   actions.push({ href: "/admin/volunteers", label: "Manage Volunteers", icon: Settings });
    //   actions.push({ href: "/admin/users", label: "Manage Users", icon: Settings });
    //   actions.push({ href: "/admin/analytics", label: "Analytics & Reports", icon: Settings });
    //   actions.push({ href: "/dashboard/imam", label: "Imam Dashboard", icon: Settings });
    }

    if (role === "business") {
      actions.push({ href: "/dashboard/business/announcements", label: "Manage Announcements", icon: Settings });
    }

    return actions;
  };

  const dashboardLink = getDashboardLink();
  const specialActions = getSpecialActions();

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        isScrolled || mobileMenuOpen
          ? "bg-white shadow-md py-2"
          : "bg-transparent py-4"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="font-bold text-xl flex items-center">
            <span className="text-green-600">Mosque</span>
            <span className="text-gray-800">Connect</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <NavigationMenu>
              <NavigationMenuList>
                {navLinks
                  .filter((link) => link.showAlways || session)
                  .map((link) => (
                    <NavigationMenuItem key={link.href}>
                      <NavigationMenuLink
                        href={link.href}
                        className={cn(
                          navigationMenuTriggerStyle(),
                          pathname === link.href && "bg-accent text-accent-foreground"
                        )}
                      >
                        {link.label}
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                  ))}
                {/* Prominent Admin Dashboard link for admin users */}
                {session?.user?.role === "admin" && (
                  <NavigationMenuItem>
                    <NavigationMenuLink
                      href="/admin/dashboard"
                      className={cn(
                        navigationMenuTriggerStyle(),
                        "text-red-600 font-bold",
                        pathname === "/admin/dashboard" && "bg-accent text-accent-foreground"
                      )}
                    >
                      🔧 Admin Dashboard
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                )}
              </NavigationMenuList>
            </NavigationMenu>

            {/* User Menu or Auth Buttons */}
            <div className="ml-4">
              {status === "authenticated" ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <Avatar>
                        <AvatarImage
                          src={session.user.image || ""}
                          alt={displayName}
                        />
                        <AvatarFallback>{userInitials}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-0.5 leading-none">
                        <p className="font-medium text-sm">{displayName}</p>
                        <p className="text-xs text-gray-500">
                          {session.user.email}
                        </p>
                        <p className="text-xs text-gray-400 capitalize">
                          {session.user.role || 'user'}
                        </p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />

                    {/* User Profile and Settings */}
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        <span>My Profile</span>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                      <Link href="/settings" className="flex items-center">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Account Settings</span>
                      </Link>
                    </DropdownMenuItem>

                    {/* Volunteer Dashboard for all users */}
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/volunteer" className="flex items-center">
                        <Heart className="mr-2 h-4 w-4" />
                        <span>🤝 Volunteer Dashboard</span>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    {/* Main Dashboard Link */}
                    {dashboardLink && (
                      <DropdownMenuItem asChild>
                        <Link href={dashboardLink.href} className="flex items-center">
                          <Settings className="mr-2 h-4 w-4" />
                          <span>{dashboardLink.label}</span>
                        </Link>
                      </DropdownMenuItem>
                    )}

                    {/* Role-specific Actions */}
                    {specialActions.length > 0 && (
                      <>
                        <DropdownMenuSeparator />
                        {specialActions.map((action, index) => (
                          <DropdownMenuItem key={index} asChild>
                            <Link href={action.href} className="flex items-center">
                              {action.icon && <action.icon className="mr-2 h-4 w-4" />}
                              <span>{action.label}</span>
                            </Link>
                          </DropdownMenuItem>
                        ))}
                      </>
                    )}

                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="text-red-600 focus:text-red-600"
                    >
                      Log Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex space-x-2">
                  <Link href="/login">
                    <Button variant="outline" size="sm">
                      Log In
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button size="sm">Register</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pt-4 pb-6">
            <nav className="flex flex-col space-y-3">
              {navLinks
                .filter((link) => link.showAlways || session)
                .map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      pathname === link.href
                        ? "bg-green-100 text-green-700"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}

              {/* Mobile User Profile Section */}
              {session && (
                <>
                  <div className="border-t pt-3 mt-3">
                    <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Account
                    </p>
                  </div>
                  <Link
                    href="/profile"
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center ${
                      pathname === "/profile"
                        ? "bg-green-100 text-green-700"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <User className="mr-2 h-4 w-4" />
                    My Profile
                  </Link>
                  <Link
                    href="/settings"
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center ${
                      pathname === "/settings"
                        ? "bg-green-100 text-green-700"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Account Settings
                  </Link>
                </>
              )}

              {/* Mobile Dashboard Links */}
              {session && (
                <>
                  <div className="border-t pt-3 mt-3">
                    <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Dashboard
                    </p>
                  </div>
                  <Link
                    href="/dashboard/volunteer"
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center ${
                      pathname === "/dashboard/volunteer"
                        ? "bg-green-100 text-green-700"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <Heart className="mr-2 h-4 w-4" />
                    🤝 Volunteer Dashboard
                  </Link>
                  {dashboardLink && dashboardLink.href !== "/dashboard/volunteer" && (
                    <Link
                      href={dashboardLink.href}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        pathname === dashboardLink.href
                          ? "bg-green-100 text-green-700"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {dashboardLink.label}
                    </Link>
                  )}
                  {specialActions.filter(action => action.href !== "/dashboard/volunteer").map((action, index) => (
                    <Link
                      key={index}
                      href={action.href}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        pathname === action.href
                          ? "bg-green-100 text-green-700"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {action.label}
                    </Link>
                  ))}
                </>
              )}

              {/* Mobile Auth Buttons */}
              {status !== "authenticated" && (
                <div className="border-t pt-3 mt-3 space-y-2">
                  <Link href="/login">
                    <Button variant="outline" className="w-full">
                      Log In
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button className="w-full">Register</Button>
                  </Link>
                </div>
              )}

              {/* Mobile Sign Out */}
              {status === "authenticated" && (
                <div className="border-t pt-3 mt-3">
                  <Button
                    variant="outline"
                    className="w-full text-red-600"
                    onClick={() => signOut({ callbackUrl: "/" })}
                  >
                    Log Out
                  </Button>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}