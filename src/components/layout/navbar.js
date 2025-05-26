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
import { Menu, X } from "lucide-react";
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

    // All authenticated users can access volunteer dashboard
    if (session) {
      actions.push({ href: "/dashboard/volunteer", label: "🤝 Volunteer Dashboard" });
    }

    if (role === "imam" || role === "admin") {
      actions.push({ href: "/dashboard/imam", label: "Imam Dashboard" });
    }

    if (role === "admin") {
      actions.push({ href: "/admin/dashboard", label: "🔧 Admin Dashboard" });
      actions.push({ href: "/admin/mosques", label: "Manage Mosques" });
      actions.push({ href: "/admin/businesses", label: "Manage Businesses" });
      actions.push({ href: "/admin/volunteers", label: "Manage Volunteers" });
      actions.push({ href: "/admin/users", label: "Manage Users" });
      actions.push({ href: "/admin/analytics", label: "Analytics & Reports" });
    }

    if (role === "business" || role === "admin") {
      actions.push({ href: "/dashboard/business/announcements", label: "Manage Announcements" });
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
                      <Link href={link.href} legacyBehavior passHref>
                        <NavigationMenuLink
                          className={cn(
                            navigationMenuTriggerStyle(),
                            pathname === link.href && "bg-accent text-accent-foreground"
                          )}
                        >
                          {link.label}
                        </NavigationMenuLink>
                      </Link>
                    </NavigationMenuItem>
                  ))}
                {/* Prominent Admin Dashboard link for admin users */}
                {session?.user?.role === "admin" && (
                  <NavigationMenuItem>
                    <Link href="/admin/dashboard" legacyBehavior passHref>
                      <NavigationMenuLink
                        className={cn(
                          navigationMenuTriggerStyle(),
                          "text-red-600 font-bold",
                          pathname === "/admin/dashboard" && "bg-accent text-accent-foreground"
                        )}
                      >
                        🔧 Admin Dashboard
                      </NavigationMenuLink>
                    </Link>
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
                  <DropdownMenuContent align="end">
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-0.5 leading-none">
                        <p className="font-medium text-sm">{displayName}</p>
                        <p className="text-xs text-gray-500">
                          {session.user.email}
                        </p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />

                    {dashboardLink && (
                      <DropdownMenuItem asChild>
                        <Link href={dashboardLink.href}>{dashboardLink.label}</Link>
                      </DropdownMenuItem>
                    )}

                    {specialActions.map((action, index) => (
                      <DropdownMenuItem key={index} asChild>
                        <Link href={action.href}>{action.label}</Link>
                      </DropdownMenuItem>
                    ))}

                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => signOut({ callbackUrl: "/" })}
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

              {/* Mobile Dashboard Links */}
              {session && (
                <>
                  <div className="border-t pt-3 mt-3">
                    <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Dashboard
                    </p>
                  </div>
                  {dashboardLink && (
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
                  {specialActions.map((action, index) => (
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
                    className="w-full"
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