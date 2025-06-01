'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { 
  Users, 
  Building2, 
  Store, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  MapPin,
  BarChart3,
  PieChart,
  Activity,
  Clock,
  UserCheck,
  Building,
  ArrowUp,
  ArrowDown,
  RefreshCw
} from 'lucide-react';
import axios from 'axios';

export default function AdminAnalyticsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('30d');
  const [refreshing, setRefreshing] = useState(false);

  const [analyticsData, setAnalyticsData] = useState({
    overview: {
      totalUsers: 0,
      totalMosques: 0,
      totalBusinesses: 0,
      totalVolunteers: 0,
      activeUsers: 0,
      pendingApprovals: 0,
      growthRates: {
        users: 0,
        mosques: 0,
        businesses: 0,
        volunteers: 0
      }
    },
    userAnalytics: {
      usersByRole: [],
      usersByLocation: [],
      registrationTrends: [],
      activeUsers: 0,
      verificationStats: { verified: 0, unverified: 0 }
    },
    mosquesAnalytics: {
      mosquesByLocation: [],
      statusDistribution: [],
      capacityAnalysis: [],
      servicesPopularity: [],
      verificationStats: { verified: 0, pending: 0, rejected: 0 }
    },
    businessAnalytics: {
      businessesByCategory: [],
      businessesByLocation: [],
      statusDistribution: [],
      verificationTrends: [],
      topPerformers: []
    },
    volunteerAnalytics: {
      applicationsByCategory: [],
      applicationTrends: [],
      offersByCategory: [],
      topMosques: [],
      statusDistribution: []
    }
  });

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session?.user || !['admin', 'superadmin'].includes(session.user.role)) {
      router.push('/dashboard');
      return;
    }

    fetchAnalyticsData();
  }, [session, status, router, timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/admin/analytics?timeRange=${timeRange}`);
      setAnalyticsData(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAnalyticsData();
    setRefreshing(false);
    toast.success('Analytics data refreshed');
  };

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const getGrowthIcon = (rate) => {
    if (rate > 0) return <ArrowUp className="h-4 w-4 text-green-600" />;
    if (rate < 0) return <ArrowDown className="h-4 w-4 text-red-600" />;
    return <Activity className="h-4 w-4 text-gray-600" />;
  };

  const getGrowthColor = (rate) => {
    if (rate > 0) return 'text-green-600';
    if (rate < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  // Visual Progress Bar Component
  const ProgressBar = ({ value, maxValue, color = 'bg-blue-500', height = 'h-3' }) => {
    const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
    return (
      <div className={`w-full bg-gray-200 rounded-full ${height}`}>
        <div 
          className={`${color} ${height} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    );
  };

  // Pie Chart Visual Component
  const PieChartVisual = ({ data, colors }) => {
    const total = data.reduce((sum, item) => sum + item.count, 0);
    
    return (
      <div className="space-y-3">
        {data.map((item, index) => {
          const percentage = total > 0 ? (item.count / total) * 100 : 0;
          const color = colors[index % colors.length];
          
          return (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className={`w-4 h-4 rounded ${color}`} />
                <span className="text-sm font-medium capitalize">{item.role || item.category || item.status || item.service}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">{item.count}</span>
                <span className="text-xs text-gray-500">({percentage.toFixed(1)}%)</span>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Bar Chart Visual Component
  const BarChartVisual = ({ data, color = 'bg-blue-500' }) => {
    const maxValue = Math.max(...data.map(item => item.count));
    
    return (
      <div className="space-y-4">
        {data.map((item, index) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium capitalize">{item.city ? `${item.city}, ${item.state}` : (item.category || item.service)}</span>
              <span className="text-gray-600">{item.count}</span>
            </div>
            <ProgressBar value={item.count} maxValue={maxValue} color={color} />
          </div>
        ))}
      </div>
    );
  };

  if (status === 'loading' || loading) {
    return (
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const { overview, userAnalytics, mosquesAnalytics, businessAnalytics, volunteerAnalytics } = analyticsData;

  const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-yellow-500', 'bg-red-500', 'bg-indigo-500', 'bg-pink-500'];

  return (
    <div className="container mx-auto px-4 py-8 pt-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
          <p className="text-gray-600">Comprehensive platform insights and metrics</p>
        </div>
        
        <div className="flex gap-4 items-center">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            onClick={handleRefresh} 
            disabled={refreshing}
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Total Users</p>
                <p className="text-2xl font-bold text-blue-900">{formatNumber(overview.totalUsers)}</p>
                <div className="flex items-center mt-1">
                  {getGrowthIcon(overview.growthRates.users)}
                  <span className={`text-sm ml-1 ${getGrowthColor(overview.growthRates.users)}`}>
                    {Math.abs(overview.growthRates.users)}%
                  </span>
                </div>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Total Mosques</p>
                <p className="text-2xl font-bold text-green-900">{formatNumber(overview.totalMosques)}</p>
                <div className="flex items-center mt-1">
                  {getGrowthIcon(overview.growthRates.mosques)}
                  <span className={`text-sm ml-1 ${getGrowthColor(overview.growthRates.mosques)}`}>
                    {Math.abs(overview.growthRates.mosques)}%
                  </span>
                </div>
              </div>
              <Building className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700">Total Businesses</p>
                <p className="text-2xl font-bold text-purple-900">{formatNumber(overview.totalBusinesses)}</p>
                <div className="flex items-center mt-1">
                  {getGrowthIcon(overview.growthRates.businesses)}
                  <span className={`text-sm ml-1 ${getGrowthColor(overview.growthRates.businesses)}`}>
                    {Math.abs(overview.growthRates.businesses)}%
                  </span>
                </div>
              </div>
              <Store className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-50 to-orange-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700">Total Volunteers</p>
                <p className="text-2xl font-bold text-orange-900">{formatNumber(overview.totalVolunteers)}</p>
                <div className="flex items-center mt-1">
                  {getGrowthIcon(overview.growthRates.volunteers)}
                  <span className={`text-sm ml-1 ${getGrowthColor(overview.growthRates.volunteers)}`}>
                    {Math.abs(overview.growthRates.volunteers)}%
                  </span>
                </div>
              </div>
              <UserCheck className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="mosques">Mosques</TabsTrigger>
          <TabsTrigger value="businesses">Businesses</TabsTrigger>
          <TabsTrigger value="volunteers">Volunteers</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Platform Growth
                </CardTitle>
                <CardDescription>Growth metrics across all categories</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">{overview.totalUsers}</p>
                      <p className="text-sm text-gray-600">Total Users</p>
                      <div className="flex items-center justify-center mt-1">
                        {getGrowthIcon(overview.growthRates.users)}
                        <span className={`text-xs ml-1 ${getGrowthColor(overview.growthRates.users)}`}>
                          {overview.growthRates.users}%
                        </span>
                      </div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">{overview.totalMosques}</p>
                      <p className="text-sm text-gray-600">Total Mosques</p>
                      <div className="flex items-center justify-center mt-1">
                        {getGrowthIcon(overview.growthRates.mosques)}
                        <span className={`text-xs ml-1 ${getGrowthColor(overview.growthRates.mosques)}`}>
                          {overview.growthRates.mosques}%
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <p className="text-2xl font-bold text-purple-600">{overview.totalBusinesses}</p>
                      <p className="text-sm text-gray-600">Total Businesses</p>
                      <div className="flex items-center justify-center mt-1">
                        {getGrowthIcon(overview.growthRates.businesses)}
                        <span className={`text-xs ml-1 ${getGrowthColor(overview.growthRates.businesses)}`}>
                          {overview.growthRates.businesses}%
                        </span>
                      </div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <p className="text-2xl font-bold text-orange-600">{overview.totalVolunteers}</p>
                      <p className="text-sm text-gray-600">Total Volunteers</p>
                      <div className="flex items-center justify-center mt-1">
                        {getGrowthIcon(overview.growthRates.volunteers)}
                        <span className={`text-xs ml-1 ${getGrowthColor(overview.growthRates.volunteers)}`}>
                          {overview.growthRates.volunteers}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Platform Activity
                </CardTitle>
                <CardDescription>Current platform status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">Active Users</span>
                    <span className="text-lg font-bold text-blue-600">{overview.activeUsers}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">Pending Approvals</span>
                    <Badge variant={overview.pendingApprovals > 0 ? 'destructive' : 'default'}>
                      {overview.pendingApprovals}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">User Verification Rate</span>
                    <span className="text-lg font-bold text-green-600">
                      {userAnalytics.verificationStats.verified > 0 
                        ? Math.round((userAnalytics.verificationStats.verified / overview.totalUsers) * 100)
                        : 0}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChart className="h-5 w-5 mr-2" />
                  Users by Role
                </CardTitle>
                <CardDescription>Distribution of user roles</CardDescription>
              </CardHeader>
              <CardContent>
                <PieChartVisual data={userAnalytics.usersByRole} colors={colors} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <UserCheck className="h-5 w-5 mr-2" />
                  Verification Status
                </CardTitle>
                <CardDescription>User verification breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{userAnalytics.verificationStats.verified}</p>
                    <p className="text-sm text-gray-600">Verified Users</p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <p className="text-2xl font-bold text-orange-600">{userAnalytics.verificationStats.unverified}</p>
                    <p className="text-sm text-gray-600">Unverified Users</p>
                  </div>
                  <ProgressBar 
                    value={userAnalytics.verificationStats.verified} 
                    maxValue={overview.totalUsers} 
                    color="bg-green-500" 
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Top Locations
                </CardTitle>
                <CardDescription>Users by city/state</CardDescription>
              </CardHeader>
              <CardContent>
                <BarChartVisual data={userAnalytics.usersByLocation.slice(0, 5)} color="bg-blue-500" />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="mosques" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChart className="h-5 w-5 mr-2" />
                  Status Distribution
                </CardTitle>
                <CardDescription>Mosque verification status</CardDescription>
              </CardHeader>
              <CardContent>
                <PieChartVisual data={mosquesAnalytics.statusDistribution} colors={colors} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Popular Services
                </CardTitle>
                <CardDescription>Most offered services</CardDescription>
              </CardHeader>
              <CardContent>
                <BarChartVisual data={mosquesAnalytics.servicesPopularity.slice(0, 5)} color="bg-green-500" />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Geographic Distribution
              </CardTitle>
              <CardDescription>Mosques by location</CardDescription>
            </CardHeader>
            <CardContent>
              <BarChartVisual data={mosquesAnalytics.mosquesByLocation.slice(0, 8)} color="bg-green-500" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="businesses" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChart className="h-5 w-5 mr-2" />
                  Categories
                </CardTitle>
                <CardDescription>Business category distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <PieChartVisual data={businessAnalytics.businessesByCategory} colors={colors} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Verification Status
                </CardTitle>
                <CardDescription>Business verification breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <PieChartVisual data={businessAnalytics.statusDistribution} colors={['bg-green-500', 'bg-yellow-500', 'bg-red-500']} />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Top Business Locations
              </CardTitle>
              <CardDescription>Businesses by city/state</CardDescription>
            </CardHeader>
            <CardContent>
              <BarChartVisual data={businessAnalytics.businessesByLocation.slice(0, 8)} color="bg-purple-500" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="volunteers" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Applications by Category
                </CardTitle>
                <CardDescription>Volunteer application categories</CardDescription>
              </CardHeader>
              <CardContent>
                <BarChartVisual data={volunteerAnalytics.applicationsByCategory} color="bg-purple-500" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Application Status
                </CardTitle>
                <CardDescription>Status distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {volunteerAnalytics.statusDistribution.map((status, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium capitalize">{status.status}</span>
                      <Badge variant={status.status === 'accepted' ? 'default' : status.status === 'pending' ? 'secondary' : 'destructive'}>
                        {status.count}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Top Mosques by Applications
              </CardTitle>
              <CardDescription>Most active mosques</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {volunteerAnalytics.topMosques.slice(0, 5).map((mosque, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">{mosque.mosque?.name || 'Unknown'}</p>
                      <p className="text-xs text-gray-500">{mosque.mosque?.contact?.address?.city || 'Unknown'}</p>
                    </div>
                    <Badge variant="outline">{mosque.total} applications</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}