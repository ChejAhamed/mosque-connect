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
      return { href: "/admin/unified-dashboard", label: "Admin Dashboard" };
    } else if (role === "imam") {
      return { href: "/dashboard/imam", label: "Imam Dashboard" };
    } else if (role === "business") {
      return { href: "/dashboard/business", label: "Business Dashboard" };
    }

    return null;
  };

  // Get any special actions based on user role
  const getSpecialActions = () => {
    if (!session) return [];

    const role = session.user?.role;
    const actions = [];

    if (role === "imam" || role === "admin") {
      actions.push({ href: "/mosques/register", label: "Register Mosque" });
    }

    // Add management links for admins
    if (role === "admin") {
      actions.push({ href: "/admin/unified-dashboard", label: "Approval Dashboard" });
      actions.push({ href: "/admin/dashboard", label: "Dashboard" });
      actions.push({ href: "/admin/mosques", label: "Manage Mosques" });
    }

    if (role === "business" || role === "admin") {
      actions.push({ href: "/dashboard/business/products", label: "Manage Products" });
      actions.push({ href: "/dashboard/business/announcements", label: "Manage Announcements" });
    }

     if (role === "business") {
      actions.push({ href: "/dashboard/business/products", label: "Manage Products" });
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
                        <NavigationMenuLink
                          href={link.href}
                          className={navigationMenuTriggerStyle()}
                          active={pathname === link.href}
                        >
                          {link.label}
                        </NavigationMenuLink>
                      </NavigationMenuItem>
                    ))}
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
                    className={`px-3 py-2 text-gray-700 rounded-md ${
                      pathname === link.href
                        ? "bg-gray-100 font-medium"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}

              {dashboardLink && (
                <Link
                  href={dashboardLink.href}
                  className="px-3 py-2 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  {dashboardLink.label}
                </Link>
              )}

              {specialActions.map((action, index) => (
                <Link
                  key={index}
                  href={action.href}
                  className="px-3 py-2 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  {action.label}
                </Link>
              ))}

              {status === "authenticated" ? (
                <Button
                  className="mt-2 w-full"
                  variant="outline"
                  onClick={() => signOut({ callbackUrl: "/" })}
                >
                  Log Out
                </Button>
              ) : (
                <div className="flex flex-col space-y-2 pt-2">
                  <Link href="/login" className="w-full">
                    <Button variant="outline" className="w-full">
                      Log In
                    </Button>
                  </Link>
                  <Link href="/register" className="w-full">
                    <Button className="w-full">Register</Button>
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

// Export as default as well
export default Navbar;
