"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Users,
  Building,
  ClipboardCheck,
  TrendingUp,
  Eye,
  MapPin,
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  Store
} from "lucide-react";

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  
  // Overview stats
  const [systemStats, setSystemStats] = useState({
    totalUsers: 0,
    totalMosques: 0,
    totalBusinesses: 0,
    pendingApprovals: 0
  });
  const [volunteerStats, setVolunteerStats] = useState({
    applications: { total: 0, pending: 0, accepted: 0, rejected: 0 },
    offers: { total: 0, active: 0, inactive: 0 },
    topMosques: []
  });

  // Users data
  const [users, setUsers] = useState([]);
  const [usersPagination, setUsersPagination] = useState({ current: 1, total: 1 });
  const [usersFilters, setUsersFilters] = useState({ search: '', role: 'all', verified: 'all' });

  // Volunteers data
  const [volunteerApplications, setVolunteerApplications] = useState([]);
  const [volunteerOffers, setVolunteerOffers] = useState([]);
  const [volunteerPagination, setVolunteerPagination] = useState({ current: 1, total: 1 });

  // Mosques data
  const [mosques, setMosques] = useState([]);
  const [mosquesPagination, setMosquesPagination] = useState({ current: 1, total: 1 });

  // Businesses data
  const [businesses, setBusinesses] = useState([]);
  const [businessesPagination, setBusinessesPagination] = useState({ current: 1, total: 1 });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/admin/dashboard");
      return;
    }

    if (status === "authenticated" && !['admin', 'superadmin'].includes(session?.user?.role)) {
      router.push("/unauthorized");
      return;
    }

    if (status === "authenticated") {
      fetchOverviewData();
    }
  }, [session, status, router]);

  // API call helper with better error handling
  const apiCall = async (url, options = {}) => {
    try {
      const response = await fetch(url, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });

      if (!response.ok) {
        console.error(`API call failed for ${url}: ${response.status} ${response.statusText}`);
        
        // Try to get error details from response
        try {
          const errorData = await response.json();
          console.error('Error details:', errorData);
        } catch (e) {
          console.error('Could not parse error response');
        }
        
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API call failed for ${url}:`, error);
      throw error;
    }
  };

  // Fetch overview data with better error handling
  const fetchOverviewData = async () => {
    try {
      setLoading(true);
      
      // Reset pending approvals counter
      setSystemStats(prev => ({ ...prev, pendingApprovals: 0 }));
      
      // Fetch data with individual error handling
      const promises = [
        apiCall('/api/admin/users/stats').catch(err => {
          console.error('Failed to fetch user stats:', err);
          return { total: 0 };
        }),
        apiCall('/api/admin/mosques').catch(err => {
          console.error('Failed to fetch mosques:', err);
          return { mosques: [] };
        }),
        apiCall('/api/admin/businesses').catch(err => {
          console.error('Failed to fetch businesses:', err);
          return { businesses: [] };
        }),
        apiCall('/api/admin/volunteers?type=stats').catch(err => {
          console.error('Failed to fetch volunteer stats:', err);
          return { 
            data: { 
              stats: {
                applications: { total: 0, pending: 0, accepted: 0, rejected: 0 },
                offers: { total: 0, active: 0, inactive: 0 },
                topMosques: []
              }
            }
          };
        })
      ];

      const [userStats, mosquesData, businessesData, volunteerStatsData] = await Promise.all(promises);

      // Process user stats
      setSystemStats(prev => ({ 
        ...prev, 
        totalUsers: userStats.total || 0 
      }));

      // Process mosques data
      const mosques = mosquesData.mosques || [];
      const pendingMosques = mosques.filter(m => m.status === 'pending').length;
      setSystemStats(prev => ({ 
        ...prev, 
        totalMosques: mosques.length,
        pendingApprovals: prev.pendingApprovals + pendingMosques
      }));

      // Process businesses data
      const businesses = businessesData.businesses || [];
      const pendingBusinesses = businesses.filter(b => 
        b.status === 'pending' || b.verification?.status === 'pending'
      ).length;
      setSystemStats(prev => ({ 
        ...prev, 
        totalBusinesses: businesses.length,
        pendingApprovals: prev.pendingApprovals + pendingBusinesses
      }));

      // Process volunteer stats
      setVolunteerStats(volunteerStatsData.data?.stats || {
        applications: { total: 0, pending: 0, accepted: 0, rejected: 0 },
        offers: { total: 0, active: 0, inactive: 0 },
        topMosques: []
      });

    } catch (error) {
      console.error("Error fetching overview data:", error);
      toast.error("Failed to load dashboard data. Some features may not work properly.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch users
  const fetchUsers = async (page = 1) => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...usersFilters
      });

      const data = await apiCall(`/api/admin/users?${params}`);
      setUsers(data.users || []);
      setUsersPagination(data.pagination || { current: 1, total: 1 });
    } catch (error) {
      toast.error("Failed to fetch users");
      console.error('Fetch users error:', error);
    }
  };

  // Fetch volunteer applications
  const fetchVolunteerData = async () => {
    try {
      const [applicationsData, offersData] = await Promise.allSettled([
        apiCall('/api/admin/volunteers?type=applications&limit=20'),
        apiCall('/api/admin/volunteers?type=offers&limit=20')
      ]);

      if (applicationsData.status === 'fulfilled') {
        setVolunteerApplications(applicationsData.value.data?.applications || []);
      } else {
        console.error('Failed to fetch applications:', applicationsData.reason);
      }

      if (offersData.status === 'fulfilled') {
        setVolunteerOffers(offersData.value.data?.offers || []);
      } else {
        console.error('Failed to fetch offers:', offersData.reason);
      }
    } catch (error) {
      toast.error("Failed to fetch volunteer data");
      console.error('Fetch volunteer data error:', error);
    }
  };

  // Fetch mosques
  const fetchMosques = async (page = 1) => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20'
      });

      const data = await apiCall(`/api/admin/mosques?${params}`);
      setMosques(data.mosques || []);
      setMosquesPagination(data.pagination || { current: 1, total: 1 });
    } catch (error) {
      toast.error("Failed to fetch mosques");
      console.error('Fetch mosques error:', error);
    }
  };

  // Fetch businesses
  const fetchBusinesses = async (page = 1) => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20'
      });

      const data = await apiCall(`/api/admin/businesses?${params}`);
      setBusinesses(data.businesses || []);
      setBusinessesPagination(data.pagination || { current: 1, total: 1 });
    } catch (error) {
      toast.error("Failed to fetch businesses");
      console.error('Fetch businesses error:', error);
    }
  };

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    
    switch (tab) {
      case 'users':
        fetchUsers();
        break;
      case 'volunteers':
        fetchVolunteerData();
        break;
      case 'mosques':
        fetchMosques();
        break;
      case 'businesses':
        fetchBusinesses();
        break;
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: "bg-yellow-100 text-yellow-800",
      accepted: "bg-green-100 text-green-800",
      approved: "bg-green-100 text-green-800",
      verified: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      active: "bg-green-100 text-green-800",
      inactive: "bg-gray-100 text-gray-800",
      true: "bg-green-100 text-green-800",
      false: "bg-red-100 text-red-800"
    };
    
    return (
      <Badge className={statusMap[status] || "bg-gray-100 text-gray-800"}>
        {typeof status === 'boolean' ? (status ? 'Verified' : 'Unverified') : status}
      </Badge>
    );
  };

  if (status === "loading" || loading) {
    return (
      <div className="container mx-auto p-6 pt-24">
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 pt-24">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleTabChange('users')}>
            Manage Users
          </Button>
          <Button variant="outline" onClick={() => handleTabChange('volunteers')}>
            Manage Volunteers
          </Button>
          <Button variant="outline" onClick={() => router.push('/admin/businesses')}>
            Manage Businesses
          </Button>
        </div>
      </div>

      {/* System Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleTabChange('users')}>
          <CardHeader className="bg-blue-50">
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-3xl font-bold">{systemStats.totalUsers}</p>
            <p className="text-gray-500 mt-2">Registered users</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleTabChange('mosques')}>
          <CardHeader className="bg-green-50">
            <CardTitle className="flex items-center">
              <Building className="mr-2 h-5 w-5" />
              Total Mosques
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-3xl font-bold">{systemStats.totalMosques}</p>
            <p className="text-gray-500 mt-2">Registered mosques</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleTabChange('businesses')}>
          <CardHeader className="bg-purple-50">
            <CardTitle className="flex items-center">
              <Store className="mr-2 h-5 w-5" />
              Total Businesses
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-3xl font-bold">{systemStats.totalBusinesses}</p>
            <p className="text-gray-500 mt-2">Registered businesses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="bg-orange-50">
            <CardTitle className="flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5" />
              Pending Approvals
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-3xl font-bold">{systemStats.pendingApprovals}</p>
            <p className="text-gray-500 mt-2">Require attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Volunteer Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleTabChange('volunteers')}>
          <CardHeader className="bg-blue-50">
            <CardTitle className="flex items-center">
              <ClipboardCheck className="mr-2 h-5 w-5" />
              Volunteer Applications
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-3xl font-bold">{volunteerStats.applications?.total || 0}</p>
            <p className="text-gray-500 mt-2">Total applications</p>
            <div className="flex items-center mt-3 gap-2 flex-wrap">
              <Badge variant="outline" className="flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {volunteerStats.applications?.pending || 0} Pending
              </Badge>
              <Badge variant="outline" className="flex items-center">
                <CheckCircle className="h-3 w-3 mr-1" />
                {volunteerStats.applications?.accepted || 0} Accepted
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleTabChange('volunteers')}>
          <CardHeader className="bg-green-50">
            <CardTitle className="flex items-center">
              <Eye className="mr-2 h-5 w-5" />
              General Volunteer Offers
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-3xl font-bold">{volunteerStats.offers?.total || 0}</p>
            <p className="text-gray-500 mt-2">Total offers posted</p>
            <div className="flex items-center mt-3 gap-2 flex-wrap">
              <Badge variant="outline" className="flex items-center">
                <CheckCircle className="h-3 w-3 mr-1" />
                {volunteerStats.offers?.active || 0} Active
              </Badge>
              <Badge variant="outline" className="flex items-center">
                <XCircle className="h-3 w-3 mr-1" />
                {volunteerStats.offers?.inactive || 0} Inactive
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="bg-purple-50">
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5" />
              Top Mosques by Applications
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {volunteerStats.topMosques?.length > 0 ? (
              <div className="space-y-2">
                {volunteerStats.topMosques.slice(0, 3).map((mosque, index) => (
                  <div key={mosque._id} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-sm">{index + 1}. {mosque.mosque?.name}</p>
                      <p className="text-xs text-gray-500">{mosque.mosque?.address}</p>
                    </div>
                    <Badge variant="outline">{mosque.total} apps</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No data available</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="mb-8">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users ({systemStats.totalUsers})</TabsTrigger>
          <TabsTrigger value="volunteers">Volunteers</TabsTrigger>
          <TabsTrigger value="mosques">Mosques ({systemStats.totalMosques})</TabsTrigger>
          <TabsTrigger value="businesses">Businesses ({systemStats.totalBusinesses})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <span>{systemStats.totalUsers} total users</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    <span>{volunteerStats.applications?.pending || 0} pending volunteer applications</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                    <span>{systemStats.pendingApprovals} items need approval</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>All registered users on the platform</CardDescription>
            </CardHeader>
            <CardContent>
              {users.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No users found. Click "Load Users" to fetch data.</p>
                  <Button onClick={() => fetchUsers()} className="mt-4">Load Users</Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {users.map(user => (
                    <div key={user._id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold">{user.name}</h3>
                          <p className="text-gray-600">{user.email}</p>
                        </div>
                        <div className="flex gap-2">
                          {getStatusBadge(user.role)}
                          {getStatusBadge(user.isVerified)}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Location:</span>
                          <p>{user.city || 'Not specified'}</p>
                        </div>
                        <div>
                          <span className="font-medium">Joined:</span>
                          <p>{new Date(user.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <span className="font-medium">Role:</span>
                          <p>{user.role || 'user'}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="volunteers">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Volunteer Applications</CardTitle>
                <CardDescription>Mosque-specific volunteer applications</CardDescription>
              </CardHeader>
              <CardContent>
                {volunteerApplications.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No volunteer applications found</p>
                    <Button onClick={fetchVolunteerData} className="mt-4">Load Volunteer Data</Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {volunteerApplications.map(app => (
                      <div key={app._id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-semibold">{app.userId?.name}</h3>
                            <p className="text-gray-600">{app.title}</p>
                          </div>
                          {getStatusBadge(app.status)}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Mosque:</span>
                            <p>{app.mosqueId?.name}</p>
                          </div>
                          <div>
                            <span className="font-medium">Category:</span>
                            <p>{app.category}</p>
                          </div>
                          <div>
                            <span className="font-medium">Applied:</span>
                            <p>{new Date(app.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>General Volunteer Offers</CardTitle>
                <CardDescription>Community members offering services</CardDescription>
              </CardHeader>
              <CardContent>
                {volunteerOffers.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No volunteer offers found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {volunteerOffers.map(offer => (
                      <div key={offer._id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-semibold">{offer.userId?.name}</h3>
                            <p className="text-gray-600">{offer.title}</p>
                          </div>
                          {getStatusBadge(offer.status)}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Category:</span>
                            <p>{offer.category}</p>
                          </div>
                          <div>
                            <span className="font-medium">Location:</span>
                            <p>{offer.userId?.city}</p>
                          </div>
                          <div>
                            <span className="font-medium">Posted:</span>
                            <p>{new Date(offer.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="mosques">
          <Card>
            <CardHeader>
              <CardTitle>Mosque Management</CardTitle>
              <CardDescription>All registered mosques</CardDescription>
            </CardHeader>
            <CardContent>
              {mosques.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No mosques found</p>
                  <Button onClick={() => fetchMosques()} className="mt-4">Load Mosques</Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {mosques.map(mosque => (
                    <div key={mosque._id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold">{mosque.name}</h3>
                          <p className="text-gray-600">{mosque.address}</p>
                        </div>
                        {getStatusBadge(mosque.status)}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium">City:</span>
                          <p>{mosque.city}</p>
                        </div>
                        <div>
                          <span className="font-medium">Capacity:</span>
                          <p>{mosque.capacity || 'Not specified'}</p>
                        </div>
                        <div>
                          <span className="font-medium">Registered:</span>
                          <p>{new Date(mosque.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="businesses">
          <Card>
            <CardHeader>
              <CardTitle>Business Management</CardTitle>
              <CardDescription>All registered businesses</CardDescription>
            </CardHeader>
            <CardContent>
              {businesses.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No businesses found</p>
                  <Button onClick={() => fetchBusinesses()} className="mt-4">Load Businesses</Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {businesses.map(business => (
                    <div key={business._id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold">{business.businessName || business.name}</h3>
                          <p className="text-gray-600">{business.contact?.address?.street || business.address}</p>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="outline">{business.category || business.businessType}</Badge>
                          {getStatusBadge(business.status || business.verification?.status)}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Email:</span>
                          <p>{business.email || business.contact?.email}</p>
                        </div>
                        <div>
                          <span className="font-medium">City:</span>
                          <p>{business.contact?.address?.city || business.city}</p>
                        </div>
                        <div>
                          <span className="font-medium">Registered:</span>
                          <p>{new Date(business.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}