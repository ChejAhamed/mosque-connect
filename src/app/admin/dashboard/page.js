'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Line
} from 'recharts';
import {
  Users,
  Building,
  UserCheck,
  MapPin,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Edit,
  Trash2,
  Activity,
  Calendar,
  Mail,
  Phone
} from 'lucide-react';

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalMosques: 0,
    totalBusinesses: 0,
    totalVolunteers: 0,
    pendingApprovals: 0,
    mosqueStats: { pending: 0, approved: 0, rejected: 0 },
    userGrowth: [],
    businessByCategory: []
  });

  const [recentActivity, setRecentActivity] = useState([]);
  const [mosques, setMosques] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [users, setUsers] = useState([]);

  // Authentication check
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/admin/dashboard");
      return;
    }

    if (status === "authenticated" && session?.user?.role !== "admin") {
      router.push("/unauthorized");
      return;
    }

    if (status === "authenticated") {
      fetchDashboardData();
    }
  }, [status, session, router]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch all dashboard data in parallel
      const [
        statsRes,
        mosquesRes,
        businessesRes,
        volunteersRes,
        usersRes,
        activityRes
      ] = await Promise.all([
        axios.get('/api/admin/stats'),
        axios.get('/api/admin/mosques'),
        axios.get('/api/admin/businesses'),
        axios.get('/api/admin/volunteers'),
        axios.get('/api/admin/users'),
        axios.get('/api/admin/activity')
      ]);

      setStats(statsRes.data);
      setMosques(mosquesRes.data || []);
      setBusinesses(businessesRes.data || []);
      setVolunteers(volunteersRes.data || []);
      setUsers(usersRes.data || []);
      setRecentActivity(activityRes.data || []);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMosqueAction = async (mosqueId, action) => {
    try {
      await axios.patch(`/api/admin/mosques/${mosqueId}`, { status: action });
      toast({
        title: "Success",
        description: `Mosque ${action === 'approved' ? 'approved' : 'rejected'} successfully`
      });
      fetchDashboardData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update mosque status",
        variant: "destructive"
      });
    }
  };

  const handleUserAction = async (userId, action) => {
    try {
      await axios.patch(`/api/admin/users/${userId}`, { status: action });
      toast({
        title: "Success",
        description: `User ${action} successfully`
      });
      fetchDashboardData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user status",
        variant: "destructive"
      });
    }
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
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Comprehensive system management and analytics</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={fetchDashboardData}>
            <Activity className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Statistics Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">All registered users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Mosques</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMosques}</div>
            <p className="text-xs text-muted-foreground">
              {stats.mosqueStats.approved} approved, {stats.mosqueStats.pending} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Businesses</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBusinesses}</div>
            <p className="text-xs text-muted-foreground">Active businesses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Volunteers</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalVolunteers}</div>
            <p className="text-xs text-muted-foreground">Active volunteers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pendingApprovals}</div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-3">
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="businesses">Businesses</TabsTrigger>
              <TabsTrigger value="mosques">Mosques</TabsTrigger>
              <TabsTrigger value="volunteers">Volunteers</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* User Growth Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>User Growth Trend</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={stats.userGrowth}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="users" stroke="#8884d8" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Mosque Status Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle>Mosque Status Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Approved', value: stats.mosqueStats.approved },
                            { name: 'Pending', value: stats.mosqueStats.pending },
                            { name: 'Rejected', value: stats.mosqueStats.rejected }
                          ]}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {[
                            { name: 'Approved', value: stats.mosqueStats.approved },
                            { name: 'Pending', value: stats.mosqueStats.pending },
                            { name: 'Rejected', value: stats.mosqueStats.rejected }
                          ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link href="/admin/mosques">
                      <Button className="w-full" variant="outline">
                        <Building className="h-4 w-4 mr-2" />
                        Review Mosque Requests
                      </Button>
                    </Link>
                    <Link href="/admin/volunteers">
                      <Button className="w-full" variant="outline">
                        <UserCheck className="h-4 w-4 mr-2" />
                        Manage Volunteers
                      </Button>
                    </Link>
                    <Link href="/admin/analytics">
                      <Button className="w-full" variant="outline">
                        <TrendingUp className="h-4 w-4 mr-2" />
                        View Analytics
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Businesses Tab */}
            <TabsContent value="businesses">
              <Card>
                <CardHeader>
                  <CardTitle>Business Management</CardTitle>
                  <CardDescription>Manage registered businesses and their information</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Business Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Owner</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {businesses.slice(0, 10).map((business) => (
                        <TableRow key={business._id}>
                          <TableCell className="font-medium">{business.name}</TableCell>
                          <TableCell>{business.category}</TableCell>
                          <TableCell>{business.owner?.name || 'N/A'}</TableCell>
                          <TableCell>
                            <Badge variant={business.status === 'active' ? 'default' : 'secondary'}>
                              {business.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
                <CardFooter>
                  <Link href="/admin/businesses">
                    <Button>View All Businesses</Button>
                  </Link>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Mosques Tab */}
            <TabsContent value="mosques">
              <Card>
                <CardHeader>
                  <CardTitle>Mosque Management</CardTitle>
                  <CardDescription>Review and approve mosque registration requests</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Mosque Name</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Imam</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mosques.slice(0, 10).map((mosque) => (
                        <TableRow key={mosque._id}>
                          <TableCell className="font-medium">{mosque.name}</TableCell>
                          <TableCell>{mosque.address?.city}, {mosque.address?.state}</TableCell>
                          <TableCell>{mosque.imam?.name || 'N/A'}</TableCell>
                          <TableCell>
                            <Badge variant={
                              mosque.status === 'approved' ? 'default' :
                              mosque.status === 'pending' ? 'secondary' : 'destructive'
                            }>
                              {mosque.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              {mosque.status === 'pending' && (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={() => handleMosqueAction(mosque._id, 'approved')}
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleMosqueAction(mosque._id, 'rejected')}
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                              <Button size="sm" variant="outline">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
                <CardFooter>
                  <Link href="/admin/mosques">
                    <Button>View All Mosques</Button>
                  </Link>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Volunteers Tab */}
            <TabsContent value="volunteers">
              <Card>
                <CardHeader>
                  <CardTitle>Volunteer Management</CardTitle>
                  <CardDescription>Manage volunteer applications and assignments</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Skills</TableHead>
                        <TableHead>Availability</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {volunteers.slice(0, 10).map((volunteer) => (
                        <TableRow key={volunteer._id}>
                          <TableCell className="font-medium">{volunteer.name}</TableCell>
                          <TableCell>{volunteer.skills?.slice(0, 2).join(', ')}</TableCell>
                          <TableCell>{volunteer.availability}</TableCell>
                          <TableCell>
                            <Badge variant={volunteer.status === 'active' ? 'default' : 'secondary'}>
                              {volunteer.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
                <CardFooter>
                  <Link href="/admin/volunteers">
                    <Button>View All Volunteers</Button>
                  </Link>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users">
              <Card>
                <CardHeader>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>Manage user accounts and permissions</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.slice(0, 10).map((user) => (
                        <TableRow key={user._id}>
                          <TableCell className="font-medium">{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{user.role}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                              {user.status || 'active'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
                <CardFooter>
                  <Link href="/admin/users">
                    <Button>View All Users</Button>
                  </Link>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Business by Category</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={stats.businessByCategory}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="category" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>System Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span>Database Performance</span>
                        <Badge variant="default">Excellent</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>API Response Time</span>
                        <Badge variant="default">Good</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>User Activity</span>
                        <Badge variant="default">High</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Recent Activity Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.slice(0, 10).map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      {activity.type === 'mosque_approved' && <CheckCircle className="h-4 w-4 text-green-500" />}
                      {activity.type === 'mosque_rejected' && <XCircle className="h-4 w-4 text-red-500" />}
                      {activity.type === 'user_registered' && <Users className="h-4 w-4 text-blue-500" />}
                      {activity.type === 'business_registered' && <Building className="h-4 w-4 text-purple-500" />}
                      {!['mosque_approved', 'mosque_rejected', 'user_registered', 'business_registered'].includes(activity.type) &&
                        <AlertCircle className="h-4 w-4 text-gray-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{activity.description}</p>
                      <p className="text-xs text-gray-500">{activity.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
