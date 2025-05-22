'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';
import {
  User, Users, Store, MapPin, ChevronUp, Activity,
  BarChart, PieChart, Building, Award, CheckCircle, XCircle, Clock
} from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-states';

// Initial stats structure
const INITIAL_STATS = {
  users: { total: 0, male: 0, female: 0, other: 0 },
  imams: { total: 0, male: 0, female: 0 },
  businesses: { total: 0, categories: [] },
  volunteers: { total: 0 },
  cities: { total: 0, top: [] },
  mosques: { total: 0 },
  halalCertifications: { total: 0, pending: 0, approved: 0, rejected: 0 }
};

export default function AdminDashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { toast } = useToast();
  const [stats, setStats] = useState(INITIAL_STATS);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch dashboard statistics
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);

        // Check if user is authenticated and is admin
        if (status === 'unauthenticated') {
          router.push('/login?callbackUrl=/admin/dashboard');
          return;
        }

        if (status === 'authenticated' && session.user.role !== 'admin') {
          router.push('/unauthorized');
          return;
        }

        // Fetch real stats from API
        const response = await axios.get('/api/admin/stats');
        setStats(response.data.stats);
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);

        // If API fails, use fallback demo data
        const demoStats = generateDemoStats();
        setStats(demoStats);

        toast({
          title: 'Using Demo Data',
          description: 'Showing sample data as we couldn\'t fetch real statistics',
          variant: 'default'
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (status !== 'loading') {
      fetchStats();
    }
  }, [toast, router, status, session]);

  if (status === 'loading' || isLoading) {
    return <LoadingSpinner message="Loading dashboard statistics..." />;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <Tabs
        defaultValue="overview"
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="imams">Imams</TabsTrigger>
          <TabsTrigger value="businesses">Businesses</TabsTrigger>
          <TabsTrigger value="locations">Locations</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Users"
              value={stats.users.total}
              description="Registered accounts"
              icon={<Users className="h-8 w-8 text-blue-500" />}
            />
            <StatCard
              title="Mosques"
              value={stats.mosques.total}
              description="Registered mosques"
              icon={<Building className="h-8 w-8 text-green-600" />}
            />
            <StatCard
              title="Businesses"
              value={stats.businesses.total}
              description="Registered businesses"
              icon={<Store className="h-8 w-8 text-purple-600" />}
            />
            <StatCard
              title="Volunteers"
              value={stats.volunteers.total}
              description="Active volunteers"
              icon={<User className="h-8 w-8 text-orange-500" />}
            />
          </div>

          {/* Admin Tools Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Mosque Management</CardTitle>
                <CardDescription>Manage mosque approval requests</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 mb-4">
                  Review and approve mosque registration requests from imams and administrators.
                </p>
                <div className="flex justify-end">
                  <a href="/admin/mosques" className="text-green-600 hover:text-green-800 font-medium text-sm">
                    Manage Mosques →
                  </a>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Mosque Statistics</CardTitle>
                <CardDescription>Analyze mosque data and trends</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 mb-4">
                  View detailed statistics and charts about mosques, their features, and geographic distribution.
                </p>
                <div className="flex justify-end">
                  <a href="/admin/mosque-statistics" className="text-green-600 hover:text-green-800 font-medium text-sm">
                    View Statistics →
                  </a>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Mosque Map</CardTitle>
                <CardDescription>Interactive mosque location map</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 mb-4">
                  Explore mosque locations on an interactive map with search and filtering capabilities.
                </p>
                <div className="flex justify-end">
                  <a href="/admin/mosque-map" className="text-green-600 hover:text-green-800 font-medium text-sm">
                    Open Map →
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Halal Certifications</CardTitle>
                <CardDescription>Status of certification requests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80 flex items-center justify-center">
                  <div className="w-full max-w-md">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                      <StatCard
                        title="Pending"
                        value={stats.halalCertifications.pending}
                        description="Awaiting review"
                        icon={<Clock className="h-6 w-6 text-yellow-500" />}
                        compact
                      />
                      <StatCard
                        title="Approved"
                        value={stats.halalCertifications.approved}
                        description="Certified halal"
                        icon={<CheckCircle className="h-6 w-6 text-green-500" />}
                        compact
                      />
                    </div>

                    <div className="flex flex-col space-y-4">
                      <CertificationBar
                        label="Pending"
                        count={stats.halalCertifications.pending}
                        total={stats.halalCertifications.total}
                        color="bg-yellow-500"
                        icon={<Clock className="h-4 w-4 mr-2 text-yellow-500" />}
                      />
                      <CertificationBar
                        label="Approved"
                        count={stats.halalCertifications.approved}
                        total={stats.halalCertifications.total}
                        color="bg-green-500"
                        icon={<CheckCircle className="h-4 w-4 mr-2 text-green-500" />}
                      />
                      <CertificationBar
                        label="Rejected"
                        count={stats.halalCertifications.rejected}
                        total={stats.halalCertifications.total}
                        color="bg-red-500"
                        icon={<XCircle className="h-4 w-4 mr-2 text-red-500" />}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Cities</CardTitle>
                <CardDescription>{stats.cities.total} cities in total</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80 flex flex-col justify-between">
                  <div className="space-y-4">
                    {stats.cities.top.slice(0, 5).map((city, index) => (
                      <CityBar
                        key={city.name}
                        name={city.name}
                        count={city.count}
                        rank={index + 1}
                      />
                    ))}
                  </div>
                  <div className="text-center mt-4">
                    <button
                      className="text-sm text-blue-600 hover:text-blue-800"
                      onClick={() => setActiveTab('locations')}
                    >
                      View all cities →
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              title="Total Users"
              value={stats.users.total}
              description="Registered accounts"
              icon={<Users className="h-8 w-8 text-blue-500" />}
            />
            <StatCard
              title="Male Users"
              value={stats.users.male}
              description={`${Math.round(stats.users.male / stats.users.total * 100) || 0}% of users`}
              icon={<User className="h-8 w-8 text-blue-600" />}
            />
            <StatCard
              title="Female Users"
              value={stats.users.female}
              description={`${Math.round(stats.users.female / stats.users.total * 100) || 0}% of users`}
              icon={<User className="h-8 w-8 text-pink-500" />}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>User Demographics</CardTitle>
              <CardDescription>Detailed breakdown of user statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center p-12 text-gray-500">
                <BarChart className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>Detailed user analytics charts will be implemented here</p>
                <p className="text-sm mt-2">Coming soon in the next update</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Imams Tab */}
        <TabsContent value="imams" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              title="Total Imams"
              value={stats.imams.total}
              description="Mosque representatives"
              icon={<MapPin className="h-8 w-8 text-green-600" />}
            />
            <StatCard
              title="Mosques"
              value={stats.mosques.total}
              description="Registered mosques"
              icon={<Building className="h-8 w-8 text-green-700" />}
            />
            <StatCard
              title="Imam-Mosque Ratio"
              value={stats.mosques.total > 0 ? (stats.imams.total / stats.mosques.total).toFixed(2) : 0}
              description="Imams per mosque"
              icon={<Award className="h-8 w-8 text-green-500" />}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Mosque Distribution</CardTitle>
              <CardDescription>Total mosques: {stats.mosques.total}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center p-12 text-gray-500">
                <PieChart className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>Mosque distribution charts will be implemented here</p>
                <p className="text-sm mt-2">Coming soon in the next update</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Businesses Tab */}
        <TabsContent value="businesses" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              title="Total Businesses"
              value={stats.businesses.total}
              description="Registered businesses"
              icon={<Store className="h-8 w-8 text-purple-600" />}
            />
            <StatCard
              title="Business Categories"
              value={stats.businesses.categories?.length || 0}
              description="Different business types"
              icon={<Activity className="h-8 w-8 text-purple-500" />}
            />
            <StatCard
              title="Halal Certified"
              value={stats.halalCertifications.approved}
              description={`${Math.round((stats.halalCertifications.approved / stats.businesses.total) * 100) || 0}% of businesses`}
              icon={<Award className="h-8 w-8 text-purple-500" />}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Business Analytics</CardTitle>
              <CardDescription>Detailed breakdown of business statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center p-12 text-gray-500">
                <BarChart className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>Detailed business analytics will be implemented here</p>
                <p className="text-sm mt-2">Coming soon in the next update</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Locations Tab */}
        <TabsContent value="locations" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StatCard
              title="Total Cities"
              value={stats.cities.total}
              description="Cities with users"
              icon={<MapPin className="h-8 w-8 text-red-500" />}
            />
            {stats.cities.top.length > 0 && (
              <StatCard
                title="Top City"
                value={stats.cities.top[0]?.name || "None"}
                description={`${stats.cities.top[0]?.count || 0} users`}
                icon={<MapPin className="h-8 w-8 text-blue-500" />}
              />
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>City Distribution</CardTitle>
              <CardDescription>Users per city</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {stats.cities.top.map((city, index) => (
                  <CityBar
                    key={city.name}
                    name={city.name}
                    count={city.count}
                    rank={index + 1}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Generate demo stats for fallback
function generateDemoStats() {
  return {
    users: {
      total: Math.floor(Math.random() * 2000) + 1000,
      male: Math.floor(Math.random() * 800) + 400,
      female: Math.floor(Math.random() * 800) + 400,
      other: Math.floor(Math.random() * 50)
    },
    imams: {
      total: Math.floor(Math.random() * 300) + 100,
      male: Math.floor(Math.random() * 250) + 90,
      female: Math.floor(Math.random() * 50) + 10
    },
    businesses: {
      total: Math.floor(Math.random() * 500) + 200,
      categories: ['Restaurant', 'Grocery', 'Butcher', 'Bakery', 'Clothing', 'Electronics', 'Services']
    },
    volunteers: {
      total: Math.floor(Math.random() * 400) + 150
    },
    cities: {
      total: Math.floor(Math.random() * 100) + 20,
      top: [
        { name: 'London', count: Math.floor(Math.random() * 500) + 300 },
        { name: 'Birmingham', count: Math.floor(Math.random() * 300) + 200 },
        { name: 'Manchester', count: Math.floor(Math.random() * 200) + 150 },
        { name: 'Leeds', count: Math.floor(Math.random() * 150) + 100 },
        { name: 'Glasgow', count: Math.floor(Math.random() * 100) + 80 },
        { name: 'Liverpool', count: Math.floor(Math.random() * 90) + 70 },
        { name: 'Edinburgh', count: Math.floor(Math.random() * 80) + 60 },
        { name: 'Cardiff', count: Math.floor(Math.random() * 70) + 50 },
        { name: 'Bristol', count: Math.floor(Math.random() * 60) + 40 },
        { name: 'Newcastle', count: Math.floor(Math.random() * 50) + 30 },
      ]
    },
    mosques: {
      total: Math.floor(Math.random() * 800) + 400
    },
    halalCertifications: {
      total: Math.floor(Math.random() * 250) + 100,
      pending: Math.floor(Math.random() * 80) + 30,
      approved: Math.floor(Math.random() * 120) + 50,
      rejected: Math.floor(Math.random() * 30) + 10
    }
  };
}

// Stat Card Component
function StatCard({ title, value, description, icon, trend, compact = false }) {
  return (
    <Card>
      <CardContent className={compact ? "p-4" : "p-6"}>
        <div className="flex justify-between items-start">
          <div>
            <p className={`${compact ? "text-xs" : "text-sm"} font-medium text-gray-500`}>{title}</p>
            <h3 className={`${compact ? "text-xl" : "text-2xl"} font-bold mt-1`}>{typeof value === 'number' ? value.toLocaleString() : value}</h3>
            <p className={`${compact ? "text-xs" : "text-xs"} text-gray-500 mt-1`}>{description}</p>
          </div>
          <div className="bg-gray-100 p-3 rounded-full">{icon}</div>
        </div>

        {trend !== undefined && (
          <div className="mt-4 flex items-center">
            <div className={`flex items-center ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend >= 0 ? (
                <ChevronUp className="h-4 w-4 mr-1" />
              ) : (
                <ChevronUp className="h-4 w-4 mr-1 transform rotate-180" />
              )}
              <span className="text-sm font-medium">{Math.abs(trend)}%</span>
            </div>
            <span className="text-xs text-gray-500 ml-2">since last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Certification Distribution Bar Component
function CertificationBar({ label, count, total, color, icon }) {
  const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          {icon}
          <span className="text-sm font-medium">{label}</span>
        </div>
        <div className="text-sm text-gray-500">
          {count.toLocaleString()} ({percentage}%)
        </div>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${color}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}

// City Bar Component
function CityBar({ name, count, rank }) {
  return (
    <div className="flex items-center space-x-3">
      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
        <span className="text-xs font-semibold text-gray-700">{rank}</span>
      </div>
      <div className="flex-grow">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium">{name}</span>
          <span className="text-xs text-gray-500">{count.toLocaleString()} users</span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500"
            style={{ width: `${Math.min(100, count / 10)}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}
