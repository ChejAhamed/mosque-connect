'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-states';
import {
  Store,
  Package,
  Megaphone,
  Users,
  Settings,
  FileText,
  ChevronRight,
  LineChart,
  ShoppingBag,
  Clock
} from 'lucide-react';

export default function BusinessDashboard() {
  const { data: session, status } = useSession();
  const [businessData, setBusinessData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBusinessData = async () => {
      try {
        setIsLoading(true);
        // In a real application, we would fetch business data from an API
        // For now, we'll use mock data with a simulated delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        setBusinessData({
          name: 'Halal Groceries & Butcher',
          productsCount: 12,
          announcementsCount: 3,
          views: 245,
          profileCompletion: 85,
        });
      } catch (err) {
        console.error('Error fetching business data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (status === 'authenticated') {
      fetchBusinessData();
    }
  }, [status]);

  if (status === 'loading' || isLoading) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  if (!session) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
        <p className="text-gray-600 mb-6">
          Please sign in to access your business dashboard.
        </p>
        <Link href="/login">
          <Button>Sign In</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Business Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Manage your business profile, products, and announcements.
        </p>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Profile Completion</CardTitle>
            <Settings className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{businessData?.profileCompletion || 0}%</div>
            <div className="mt-2 h-2 w-full bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full"
                style={{ width: `${businessData?.profileCompletion || 0}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Complete your profile to attract more customers
            </p>
          </CardContent>
          <CardFooter className="pt-0">
            <Link href="/dashboard/business/profile" className="text-sm text-blue-600 hover:underline">
              Edit Profile
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Products</CardTitle>
            <Package className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{businessData?.productsCount || 0}</div>
            <p className="text-xs text-gray-500 mt-2">
              Products listed on your profile
            </p>
          </CardContent>
          <CardFooter className="pt-0">
            <Link href="/dashboard/business/products" className="text-sm text-blue-600 hover:underline">
              Manage Products
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Announcements</CardTitle>
            <Megaphone className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{businessData?.announcementsCount || 0}</div>
            <p className="text-xs text-gray-500 mt-2">
              Active announcements and offers
            </p>
          </CardContent>
          <CardFooter className="pt-0">
            <Link href="/dashboard/business/announcements" className="text-sm text-blue-600 hover:underline">
              Manage Announcements
            </Link>
          </CardFooter>
        </Card>
      </div>

      {/* Management Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Business Management</CardTitle>
            <CardDescription>
              Manage your business details and offerings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/dashboard/business/profile">
              <Button variant="outline" className="w-full justify-between">
                <span className="flex items-center">
                  <Store className="h-4 w-4 mr-2" />
                  Profile Settings
                </span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>

            <Link href="/dashboard/business/products">
              <Button variant="outline" className="w-full justify-between">
                <span className="flex items-center">
                  <Package className="h-4 w-4 mr-2" />
                  Products
                </span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>

            <Link href="/dashboard/business/announcements">
              <Button variant="outline" className="w-full justify-between">
                <span className="flex items-center">
                  <Megaphone className="h-4 w-4 mr-2" />
                  Announcements & Offers
                </span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>

            <Link href="/dashboard/business/orders">
              <Button variant="outline" className="w-full justify-between">
                <span className="flex items-center">
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Orders
                </span>
                <ChevronRight className="h-4 w-4" />
                <Badge className="bg-gray-200 text-gray-600 text-xs">Coming Soon</Badge>
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardHeader>
            <CardTitle>Insights</CardTitle>
            <CardDescription>
              View analytics and customer engagement
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/dashboard/business/analytics">
              <Button variant="outline" className="w-full justify-between">
                <span className="flex items-center">
                  <LineChart className="h-4 w-4 mr-2" />
                  Analytics
                </span>
                <ChevronRight className="h-4 w-4" />
                <Badge className="bg-gray-200 text-gray-600 text-xs">Coming Soon</Badge>
              </Button>
            </Link>

            <Link href="/dashboard/business/customers">
              <Button variant="outline" className="w-full justify-between">
                <span className="flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  Customers
                </span>
                <ChevronRight className="h-4 w-4" />
                <Badge className="bg-gray-200 text-gray-600 text-xs">Coming Soon</Badge>
              </Button>
            </Link>

            <Link href="/dashboard/business/reports">
              <Button variant="outline" className="w-full justify-between">
                <span className="flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  Reports
                </span>
                <ChevronRight className="h-4 w-4" />
                <Badge className="bg-gray-200 text-gray-600 text-xs">Coming Soon</Badge>
              </Button>
            </Link>

            <Link href="/dashboard/business/events">
              <Button variant="outline" className="w-full justify-between">
                <span className="flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  Events
                </span>
                <ChevronRight className="h-4 w-4" />
                <Badge className="bg-gray-200 text-gray-600 text-xs">Coming Soon</Badge>
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
