"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

// Helper function to get initials from a name
const getInitials = (name) => {
  if (!name) return "U";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
};

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("profile");

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/profile");
    }
  }, [status, router]);

  // Show loading state while session is loading
  if (status === "loading") {
    return (
      <div className="container py-10">
        <Card>
          <CardHeader>
            <div className="h-8 bg-gray-200 rounded animate-pulse w-1/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="h-20 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If not authenticated, show a message (this should rarely happen because of the redirect)
  if (!session) {
    return (
      <div className="container py-10">
        <Alert className="bg-yellow-50 border border-yellow-200">
          <AlertDescription>
            You need to be logged in to view your profile.{" "}
            <Link href="/login?callbackUrl=/profile" className="text-blue-600 hover:underline">
              Login here
            </Link>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const user = session.user;
  const userRole = user?.role || "user";

  // Define role-specific navigation and content
  const roleConfig = {
    admin: {
      title: "Admin Dashboard",
      description: "Manage the entire platform",
      dashboardUrl: "/admin/dashboard",
      dashboardLabel: "Admin Dashboard",
      tabs: ["profile", "settings", "admin"],
      color: "purple",
    },
    imam: {
      title: "Mosque Admin",
      description: "Manage your mosque profile and updates",
      dashboardUrl: "/dashboard/imam",
      dashboardLabel: "Mosque Dashboard",
      tabs: ["profile", "settings", "mosque"],
      color: "blue",
    },
    business: {
      title: "Business Owner",
      description: "Manage your business profile, products, and announcements",
      dashboardUrl: "/dashboard/business",
      dashboardLabel: "Business Dashboard",
      tabs: ["profile", "settings", "business"],
      color: "green",
    },
    volunteer: {
      title: "Volunteer",
      description: "Manage your volunteer activities and find opportunities",
      dashboardUrl: "/dashboard/volunteer",
      dashboardLabel: "Volunteer Dashboard",
      tabs: ["profile", "settings", "volunteer"],
      color: "orange",
    },
    user: {
      title: "Member",
      description: "Your personal account",
      dashboardUrl: "/dashboard",
      dashboardLabel: "Dashboard",
      tabs: ["profile", "settings"],
      color: "gray",
    },
  };

  // Use the configuration for the user's role or fall back to regular user config
  const config = roleConfig[userRole] || roleConfig.user;

  return (
    <div className="container py-10">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">{config.title}</CardTitle>
              <CardDescription>{config.description}</CardDescription>
            </div>
            <Badge
              className={`bg-${config.color}-100 text-${config.color}-700 border border-${config.color}-200 capitalize px-3 py-1`}
            >
              {userRole}
            </Badge>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="profile" onValueChange={setActiveTab} value={activeTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
              {userRole !== "user" && (
                <TabsTrigger value={userRole}>{userRole === "admin" ? "Admin" : userRole.charAt(0).toUpperCase() + userRole.slice(1)}</TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="profile" className="space-y-6">
              <div className="flex items-center space-x-6">
                <Avatar className="h-20 w-20">
                  <AvatarImage src="" alt={user?.name || "User"} />
                  <AvatarFallback className="text-2xl">{getInitials(user?.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-2xl font-bold">{user?.name || "User"}</h2>
                  <p className="text-gray-500">{user?.email}</p>
                  <p className="text-gray-500 capitalize">Role: {userRole}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mt-8">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Personal Information</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-gray-500">Name</div>
                    <div>{user?.name || "Not provided"}</div>
                    <div className="text-gray-500">Email</div>
                    <div>{user?.email}</div>
                    <div className="text-gray-500">Member Since</div>
                    <div>
                      {new Date().toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                      })}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Account Information</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-gray-500">User ID</div>
                    <div className="truncate">{user?.id || "N/A"}</div>
                    <div className="text-gray-500">Role</div>
                    <div className="capitalize">{userRole}</div>
                    <div className="text-gray-500">Status</div>
                    <div className="text-green-600">Active</div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Account Settings</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 rounded border border-gray-200">
                    <div>
                      <h4 className="font-medium">Profile Information</h4>
                      <p className="text-sm text-gray-500">Update your account information</p>
                    </div>
                    <Button variant="outline">Edit Profile</Button>
                  </div>

                  <div className="flex justify-between items-center p-4 rounded border border-gray-200">
                    <div>
                      <h4 className="font-medium">Password</h4>
                      <p className="text-sm text-gray-500">Change your password</p>
                    </div>
                    <Button variant="outline">Change Password</Button>
                  </div>

                  <div className="flex justify-between items-center p-4 rounded border border-gray-200">
                    <div>
                      <h4 className="font-medium">Notification Preferences</h4>
                      <p className="text-sm text-gray-500">Manage your notification settings</p>
                    </div>
                    <Button variant="outline">Update</Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Admin Tab Content */}
            {userRole === "admin" && (
              <TabsContent value="admin" className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Admin Controls</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">User Management</CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm text-gray-500">
                        Manage users, roles, and permissions
                      </CardContent>
                      <CardFooter>
                        <Button size="sm" variant="default" className="w-full">
                          <Link href="/admin/dashboard">Go to User Management</Link>
                        </Button>
                      </CardFooter>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Content Management</CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm text-gray-500">
                        Manage and moderate platform content
                      </CardContent>
                      <CardFooter>
                        <Button size="sm" variant="default" className="w-full">
                          <Link href="/admin/dashboard">Go to Content Management</Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  </div>
                </div>
              </TabsContent>
            )}

            {/* Imam Tab Content */}
            {userRole === "imam" && (
              <TabsContent value="imam" className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Mosque Administration</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Mosque Profile</CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm text-gray-500">
                        Update your mosque information, prayer times, and services
                      </CardContent>
                      <CardFooter>
                        <Button size="sm" variant="default" className="w-full">
                          <Link href="/dashboard/imam">Manage Mosque</Link>
                        </Button>
                      </CardFooter>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Community Events</CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm text-gray-500">
                        Create and manage mosque events and activities
                      </CardContent>
                      <CardFooter>
                        <Button size="sm" variant="default" className="w-full">
                          <Link href="/dashboard/imam">Manage Events</Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  </div>
                </div>
              </TabsContent>
            )}

            {/* Business Tab Content */}
            {userRole === "business" && (
              <TabsContent value="business" className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Business Management</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Products</CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm text-gray-500">
                        Manage your product catalog
                      </CardContent>
                      <CardFooter>
                        <Button size="sm" variant="default" className="w-full">
                          <Link href="/dashboard/business/products">Manage Products</Link>
                        </Button>
                      </CardFooter>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Announcements</CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm text-gray-500">
                        Create and manage business announcements
                      </CardContent>
                      <CardFooter>
                        <Button size="sm" variant="default" className="w-full">
                          <Link href="/dashboard/business/announcements">Manage Announcements</Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  </div>
                </div>
              </TabsContent>
            )}

            {/* Volunteer Tab Content */}
            {userRole === "volunteer" && (
              <TabsContent value="volunteer" className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Volunteer Opportunities</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">My Volunteer Activities</CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm text-gray-500">
                        View and manage your volunteer commitments
                      </CardContent>
                      <CardFooter>
                        <Button size="sm" variant="default" className="w-full">
                          <Link href="/dashboard/volunteer">View Activities</Link>
                        </Button>
                      </CardFooter>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Find Opportunities</CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm text-gray-500">
                        Discover new volunteer opportunities in your community
                      </CardContent>
                      <CardFooter>
                        <Button size="sm" variant="default" className="w-full">
                          <Link href="/volunteers">Browse Opportunities</Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  </div>
                </div>
              </TabsContent>
            )}
          </Tabs>
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => router.back()}>
            Back
          </Button>
          <Button>
            <Link href={config.dashboardUrl}>{config.dashboardLabel}</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
