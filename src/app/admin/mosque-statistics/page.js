'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadingSpinner } from '@/components/ui/loading-states';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  AreaChart,
  Area
} from 'recharts';
import {
  BarChart3,
  MapPin,
  Users,
  Building,
  Calendar,
  PieChart as PieChartIcon,
  Map,
  Filter
} from 'lucide-react';

// Colors for charts
const COLORS = ['#4ade80', '#f59e0b', '#60a5fa', '#8b5cf6', '#ec4899', '#ef4444', '#a855f7', '#0ea5e9'];
const STATUS_COLORS = {
  pending: '#f59e0b',
  approved: '#4ade80',
  rejected: '#ef4444'
};

export default function MosqueStatisticsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState({
    overview: {
      total: 0,
      byStatus: {
        pending: 0,
        approved: 0,
        rejected: 0
      }
    },
    byCity: [],
    byFeatures: [],
    recentActivity: [],
    byMonth: []
  });

  useEffect(() => {
    // Check authentication and authorization
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/admin/mosque-statistics');
      return;
    }

    if (status === 'authenticated' && session.user.role !== 'admin') {
      router.push('/unauthorized');
      return;
    }

    // Fetch statistics when authenticated
    if (status === 'authenticated') {
      fetchStatistics();
    }
  }, [status, session, router]);

  // Function to fetch mosque statistics
  const fetchStatistics = async () => {
    try {
      setLoading(true);

      // Fetch from API
      const response = await axios.get('/api/admin/mosque-statistics');
      setStatistics(response.data);
    } catch (error) {
      console.error('Error fetching mosque statistics:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch mosque statistics. Using sample data instead.',
        variant: 'destructive',
      });

      // Use sample data if API fails
      setStatistics(generateSampleData());
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return <LoadingSpinner message="Loading mosque statistics..." />;
  }

  // Format data for status pie chart
  const statusData = [
    { name: 'Approved', value: statistics.overview.byStatus.approved, color: STATUS_COLORS.approved },
    { name: 'Pending', value: statistics.overview.byStatus.pending, color: STATUS_COLORS.pending },
    { name: 'Rejected', value: statistics.overview.byStatus.rejected, color: STATUS_COLORS.rejected }
  ];

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Mosque Statistics</h1>
        <div className="flex space-x-2">
          <Link href="/admin/mosques">
            <Button variant="outline" className="flex items-center">
              <Filter className="mr-2 h-4 w-4" />
              Manage Mosques
            </Button>
          </Link>
          <Link href="/admin/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard
          title="Total Mosques"
          value={statistics.overview.total}
          icon={<Building className="h-5 w-5 text-gray-600" />}
          color="bg-gray-100"
        />
        <StatCard
          title="Cities Covered"
          value={statistics.byCity.length}
          icon={<MapPin className="h-5 w-5 text-blue-600" />}
          color="bg-blue-100"
        />
        <StatCard
          title="Top Features"
          value={statistics.byFeatures.length}
          icon={<Filter className="h-5 w-5 text-purple-600" />}
          color="bg-purple-100"
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-1 md:grid-cols-4 mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="geographical">Geographical</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="trends">Trends & Activity</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Mosque Status Distribution</CardTitle>
                <CardDescription>
                  Current approval status of all mosques
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) =>
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [value, 'Mosques']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Registration</CardTitle>
                <CardDescription>
                  Mosque registrations over the past 12 months
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={statistics.byMonth}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => [value, 'Mosques']} />
                      <Area
                        type="monotone"
                        dataKey="count"
                        stroke="#4ade80"
                        fill="#bbf7d0"
                        name="Registrations"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest mosque registrations and status changes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {statistics.recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {statistics.recentActivity.map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-start p-3 rounded-lg border border-gray-100 hover:bg-gray-50"
                    >
                      <div className={`rounded-full p-2 mr-3 ${
                        activity.type === 'registration'
                          ? 'bg-blue-100 text-blue-600'
                          : activity.type === 'approval'
                            ? 'bg-green-100 text-green-600'
                            : 'bg-red-100 text-red-600'
                      }`}>
                        {activity.type === 'registration'
                          ? <Building className="h-4 w-4" />
                          : activity.type === 'approval'
                            ? <Users className="h-4 w-4" />
                            : <Filter className="h-4 w-4" />
                        }
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{activity.title}</p>
                        <p className="text-sm text-gray-500">{activity.description}</p>
                      </div>
                      <div className="text-xs text-gray-400">
                        {activity.date}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-6 text-gray-500">No recent activity to display</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Geographical Tab */}
        <TabsContent value="geographical" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Cities</CardTitle>
              <CardDescription>
                Cities with the most mosques
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={statistics.byCity.slice(0, 10)}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                  >
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="city" width={80} />
                    <CartesianGrid strokeDasharray="3 3" />
                    <Tooltip formatter={(value) => [value, 'Mosques']} />
                    <Legend />
                    <Bar dataKey="count" name="Mosques" fill="#60a5fa" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Regional Mosque Map</CardTitle>
              <CardDescription>
                View approved mosques on a map
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center py-6">
                <Link href="/admin/mosque-map">
                  <Button className="flex items-center gap-2">
                    <Map className="h-4 w-4" />
                    Open Mosque Map View
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Features Tab */}
        <TabsContent value="features" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Mosque Facilities</CardTitle>
              <CardDescription>
                Most common facilities offered by mosques
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={statistics.byFeatures}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
                  >
                    <XAxis type="number" />
                    <YAxis
                      type="category"
                      dataKey="feature"
                      width={120}
                      tickFormatter={(value) => value.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                    />
                    <CartesianGrid strokeDasharray="3 3" />
                    <Tooltip
                      formatter={(value) => [value, 'Mosques']}
                      labelFormatter={(label) => label.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                    />
                    <Legend />
                    <Bar dataKey="count" name="Mosques with Feature" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Feature Availability</CardTitle>
                <CardDescription>
                  Percentage of mosques with essential facilities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6 pt-4">
                  {statistics.byFeatures.slice(0, 5).map((feature, index) => {
                    const percentage = Math.round((feature.count / statistics.overview.total) * 100);
                    return (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">
                            {feature.feature.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                          </span>
                          <span className="text-sm text-gray-500">
                            {percentage}% of mosques
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className="bg-purple-600 h-2.5 rounded-full"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Special Services</CardTitle>
                <CardDescription>
                  Mosques offering specialized services
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statistics.byFeatures.slice(5, 10)}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                        nameKey="feature"
                        label={({ feature, percent }) =>
                          `${feature.replace(/-/g, ' ')}: ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {statistics.byFeatures.slice(5, 10).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => [value, 'Mosques']}
                        labelFormatter={(label) => label.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                      />
                      <Legend formatter={(value) => value.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Registration Trends</CardTitle>
              <CardDescription>
                Mosque registrations over time
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={statistics.byMonth}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [value, 'Mosques']} />
                    <Legend />
                    <Bar dataKey="count" name="New Registrations" fill="#4ade80" />
                    <Bar dataKey="approved" name="Approved" fill="#60a5fa" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Verification Efficiency</CardTitle>
              <CardDescription>
                Time taken to verify mosque registrations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-500">Average Time to Approval</p>
                  <p className="text-2xl font-bold text-green-600">3.2 days</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-500">Oldest Pending Request</p>
                  <p className="text-2xl font-bold text-yellow-600">7 days</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-500">Approval Rate</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {Math.round((statistics.overview.byStatus.approved /
                      (statistics.overview.byStatus.approved + statistics.overview.byStatus.rejected)) * 100)}%
                  </p>
                </div>
              </div>

              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={[
                    { day: 'Same Day', count: 12 },
                    { day: '1-2 Days', count: 24 },
                    { day: '3-5 Days', count: 18 },
                    { day: '1 Week+', count: 8 },
                    { day: '2 Weeks+', count: 3 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip formatter={(value) => [value, 'Mosques']} />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="#8b5cf6"
                      fill="#c4b5fd"
                      name="Approval Time"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Stats Card Component
function StatCard({ title, value, icon, color }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <h3 className="text-2xl font-bold mt-1">{value.toLocaleString()}</h3>
          </div>
          <div className={`${color} p-3 rounded-full`}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}

// Generate sample data for testing
function generateSampleData() {
  return {
    overview: {
      total: 345,
      byStatus: {
        pending: 37,
        approved: 287,
        rejected: 21
      }
    },
    byCity: [
      { city: 'London', count: 78 },
      { city: 'Birmingham', count: 65 },
      { city: 'Manchester', count: 52 },
      { city: 'Leeds', count: 34 },
      { city: 'Leicester', count: 27 },
      { city: 'Glasgow', count: 25 },
      { city: 'Bradford', count: 22 },
      { city: 'Liverpool', count: 19 },
      { city: 'Nottingham', count: 15 },
      { city: 'Sheffield', count: 8 }
    ],
    byFeatures: [
      { feature: 'prayer-hall', count: 345 },
      { feature: 'wudu-facilities', count: 328 },
      { feature: 'womens-section', count: 290 },
      { feature: 'parking', count: 267 },
      { feature: 'wheelchair-access', count: 198 },
      { feature: 'quran-classes', count: 176 },
      { feature: 'community-hall', count: 142 },
      { feature: 'islamic-library', count: 97 },
      { feature: 'funeral-services', count: 83 },
      { feature: 'language-classes', count: 64 }
    ],
    recentActivity: [
      {
        type: 'registration',
        title: 'New Mosque Registered',
        description: 'Al-Falah Mosque in Newcastle has been registered',
        date: '2 hours ago'
      },
      {
        type: 'approval',
        title: 'Mosque Approved',
        description: 'Birmingham Central Mosque has been approved',
        date: '5 hours ago'
      },
      {
        type: 'registration',
        title: 'New Mosque Registered',
        description: 'Masjid-e-Noor in Leeds has been registered',
        date: '1 day ago'
      },
      {
        type: 'approval',
        title: 'Mosque Approved',
        description: 'East London Mosque has been approved',
        date: '2 days ago'
      },
      {
        type: 'rejection',
        title: 'Mosque Rejected',
        description: 'Invalid mosque submission from Liverpool rejected',
        date: '3 days ago'
      }
    ],
    byMonth: [
      { month: 'Jan', count: 12, approved: 10 },
      { month: 'Feb', count: 18, approved: 15 },
      { month: 'Mar', count: 25, approved: 22 },
      { month: 'Apr', count: 32, approved: 28 },
      { month: 'May', count: 22, approved: 19 },
      { month: 'Jun', count: 28, approved: 24 },
      { month: 'Jul', count: 35, approved: 30 },
      { month: 'Aug', count: 42, approved: 37 },
      { month: 'Sep', count: 38, approved: 33 },
      { month: 'Oct', count: 45, approved: 36 },
      { month: 'Nov', count: 30, approved: 22 },
      { month: 'Dec', count: 18, approved: 11 }
    ]
  };
}
