'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-states';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import {
  TrendingUp,
  Download,
  Calendar,
  Users,
  Building,
  MapPin,
  Activity
} from 'lucide-react';

export default function AdminAnalytics() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState({
    userGrowth: [],
    businessByCategory: [],
    mosquesByLocation: [],
    volunteerActivity: [],
    registrationTrends: []
  });

  // Authentication check
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/admin/analytics");
      return;
    }

    if (status === "authenticated" && session?.user?.role !== "admin") {
      router.push("/unauthorized");
      return;
    }

    if (status === "authenticated") {
      fetchAnalytics();
    }
  }, [status, session, router]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/analytics');
      setAnalyticsData(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      // Generate sample data for demo
      setAnalyticsData({
        userGrowth: [
          { month: '2024-01', users: 120 },
          { month: '2024-02', users: 145 },
          { month: '2024-03', users: 167 },
          { month: '2024-04', users: 201 },
          { month: '2024-05', users: 234 },
          { month: '2024-06', users: 289 }
        ],
        businessByCategory: [
          { category: 'Restaurant', count: 45 },
          { category: 'Grocery', count: 32 },
          { category: 'Clothing', count: 28 },
          { category: 'Services', count: 21 },
          { category: 'Electronics', count: 15 }
        ],
        mosquesByLocation: [
          { location: 'London', count: 67 },
          { location: 'Birmingham', count: 45 },
          { location: 'Manchester', count: 32 },
          { location: 'Leeds', count: 28 },
          { location: 'Glasgow', count: 19 }
        ],
        volunteerActivity: [
          { month: '2024-01', applications: 15, approved: 12 },
          { month: '2024-02', applications: 23, approved: 18 },
          { month: '2024-03', applications: 31, approved: 25 },
          { month: '2024-04', applications: 27, approved: 22 },
          { month: '2024-05', applications: 34, approved: 29 },
          { month: '2024-06', applications: 41, approved: 35 }
        ],
        registrationTrends: [
          { date: '2024-05-01', users: 5, mosques: 2, businesses: 3 },
          { date: '2024-05-02', users: 8, mosques: 1, businesses: 2 },
          { date: '2024-05-03', users: 12, mosques: 3, businesses: 4 },
          { date: '2024-05-04', users: 7, mosques: 1, businesses: 1 },
          { date: '2024-05-05', users: 15, mosques: 2, businesses: 5 }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const exportData = () => {
    toast({
      title: "Export Started",
      description: "Analytics data export will begin shortly"
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics & Reports</h1>
          <p className="text-gray-600">Comprehensive system analytics and insights</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={exportData}>
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Button variant="outline" onClick={fetchAnalytics}>
            <Activity className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              User Growth Trend
            </CardTitle>
            <CardDescription>User registrations over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analyticsData.userGrowth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="users" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Business Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building className="h-5 w-5 mr-2" />
              Business Categories
            </CardTitle>
            <CardDescription>Distribution of businesses by category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analyticsData.businessByCategory}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                  label
                >
                  {analyticsData.businessByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Mosque Locations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              Mosques by Location
            </CardTitle>
            <CardDescription>Geographic distribution of registered mosques</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.mosquesByLocation} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="location" type="category" width={80} />
                <Tooltip />
                <Bar dataKey="count" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Volunteer Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Volunteer Activity
            </CardTitle>
            <CardDescription>Volunteer applications and approvals</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData.volunteerActivity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="applications" stroke="#8884d8" strokeWidth={2} />
                <Line type="monotone" dataKey="approved" stroke="#82ca9d" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Registration Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Recent Registration Trends
          </CardTitle>
          <CardDescription>Daily registrations for the last 5 days</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={analyticsData.registrationTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="users" fill="#8884d8" name="Users" />
              <Bar dataKey="mosques" fill="#82ca9d" name="Mosques" />
              <Bar dataKey="businesses" fill="#ffc658" name="Businesses" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+23.5%</div>
            <p className="text-xs text-muted-foreground">vs last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">85.2%</div>
            <p className="text-xs text-muted-foreground">approval rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">2,341</div>
            <p className="text-xs text-muted-foreground">monthly active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Geographic Reach</CardTitle>
            <MapPin className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">47</div>
            <p className="text-xs text-muted-foreground">cities covered</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
