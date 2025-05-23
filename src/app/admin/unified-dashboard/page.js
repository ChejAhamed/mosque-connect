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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { LoadingSpinner } from '@/components/ui/loading-states';
import {
  BarChart,
  Building,
  Check,
  Clock,
  Eye,
  Filter,
  RefreshCw,
  Store,
  Trash,
  User,
  Users,
  X,
  MapPin,
  Calendar,
  CheckCircle,
  XCircle
} from 'lucide-react';

// Status badge component for consistent styling
const StatusBadge = ({ status }) => {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
    approved: 'bg-green-100 text-green-800 hover:bg-green-200',
    rejected: 'bg-red-100 text-red-800 hover:bg-red-200'
  };

  const icons = {
    pending: <Clock className="h-3 w-3 mr-1" />,
    approved: <CheckCircle className="h-3 w-3 mr-1" />,
    rejected: <XCircle className="h-3 w-3 mr-1" />
  };

  return (
    <Badge className={`flex items-center ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
      {icons[status]}
      <span>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
    </Badge>
  );
};

// Main Unified Admin Dashboard component
export default function UnifiedAdminDashboard() {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    mosques: {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0
    },
    volunteers: {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0
    },
    businesses: {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0
    }
  });
  const [entities, setEntities] = useState({
    mosques: [],
    volunteers: [],
    businesses: []
  });
  const [filteredResults, setFilteredResults] = useState({
    mosques: [],
    volunteers: [],
    businesses: []
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [notes, setNotes] = useState('');
  const [currentAction, setCurrentAction] = useState('');
  const [currentEntityType, setCurrentEntityType] = useState('');
  const [processingAction, setProcessingAction] = useState(false);

  // Check authentication and fetch data
  useEffect(() => {
    if (sessionStatus === 'unauthenticated') {
      router.push('/login?callbackUrl=/admin/unified-dashboard');
      return;
    }

    if (sessionStatus === 'authenticated') {
      if (session.user.role !== 'admin') {
        router.push('/unauthorized');
        return;
      }

      fetchAllData();
    }
  }, [sessionStatus, session, router]);

  // Fetch all data needed for the dashboard
  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchMosques(),
        fetchVolunteers(),
        fetchBusinesses()
      ]);

      // Also fetch general stats if needed
      await fetchStats();
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load some data. Please refresh the page.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch mosque data
  const fetchMosques = async () => {
    try {
      const response = await axios.get('/api/admin/mosques');
      const mosques = response.data.mosques || [];
      setEntities(prev => ({ ...prev, mosques }));
      updateFilteredResults('mosques', mosques, searchTerm, statusFilter);

      // Update stats
      const pendingCount = mosques.filter(m => m.status === 'pending').length;
      const approvedCount = mosques.filter(m => m.status === 'approved').length;
      const rejectedCount = mosques.filter(m => m.status === 'rejected').length;

      setStats(prev => ({
        ...prev,
        mosques: {
          total: mosques.length,
          pending: pendingCount,
          approved: approvedCount,
          rejected: rejectedCount
        }
      }));
    } catch (error) {
      console.error('Error fetching mosques:', error);
      toast({
        title: 'Error',
        description: 'Failed to load mosque data.',
        variant: 'destructive',
      });
    }
  };

  // Fetch volunteer data
  const fetchVolunteers = async () => {
    try {
      const response = await axios.get('/api/admin/volunteers');
      const volunteers = response.data.volunteers || [];
      setEntities(prev => ({ ...prev, volunteers }));
      updateFilteredResults('volunteers', volunteers, searchTerm, statusFilter);

      // Update stats
      const pendingCount = volunteers.filter(v => v.status === 'pending').length;
      const approvedCount = volunteers.filter(v => v.status === 'approved').length;
      const rejectedCount = volunteers.filter(v => v.status === 'rejected').length;

      setStats(prev => ({
        ...prev,
        volunteers: {
          total: volunteers.length,
          pending: pendingCount,
          approved: approvedCount,
          rejected: rejectedCount
        }
      }));
    } catch (error) {
      console.error('Error fetching volunteers:', error);
      toast({
        title: 'Error',
        description: 'Failed to load volunteer data.',
        variant: 'destructive',
      });
    }
  };

  // Fetch business data
  const fetchBusinesses = async () => {
    try {
      const response = await axios.get('/api/admin/businesses');
      const businesses = response.data.businesses || [];
      setEntities(prev => ({ ...prev, businesses }));
      updateFilteredResults('businesses', businesses, searchTerm, statusFilter);

      // Update stats
      const pendingCount = businesses.filter(b => b.status === 'pending').length;
      const approvedCount = businesses.filter(b => b.status === 'approved').length;
      const rejectedCount = businesses.filter(b => b.status === 'rejected').length;

      setStats(prev => ({
        ...prev,
        businesses: {
          total: businesses.length,
          pending: pendingCount,
          approved: approvedCount,
          rejected: rejectedCount
        }
      }));
    } catch (error) {
      console.error('Error fetching businesses:', error);
      toast({
        title: 'Error',
        description: 'Failed to load business data.',
        variant: 'destructive',
      });
    }
  };

  // Fetch general statistics
  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/admin/stats');
      // Process and use the stats as needed
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Update filtered results based on search and filters
  const updateFilteredResults = (entityType, data, search, status) => {
    let filtered = [...data];

    // Apply status filter if not 'all'
    if (status !== 'all') {
      filtered = filtered.filter(item => item.status === status);
    }

    // Apply search filter if not empty
    if (search) {
      const lowercaseSearch = search.toLowerCase();
      filtered = filtered.filter(item => {
        // Different search criteria based on entity type
        if (entityType === 'mosques') {
          return (
            item.name?.toLowerCase().includes(lowercaseSearch) ||
            item.city?.toLowerCase().includes(lowercaseSearch) ||
            item.address?.toLowerCase().includes(lowercaseSearch)
          );
        } else if (entityType === 'volunteers') {
          return (
            item.name?.toLowerCase().includes(lowercaseSearch) ||
            (item.skills && item.skills.some(skill =>
              skill.toLowerCase().includes(lowercaseSearch)
            ))
          );
        } else if (entityType === 'businesses') {
          return (
            item.name?.toLowerCase().includes(lowercaseSearch) ||
            item.type?.toLowerCase().includes(lowercaseSearch) ||
            item.city?.toLowerCase().includes(lowercaseSearch)
          );
        }
        return false;
      });
    }

    setFilteredResults(prev => ({
      ...prev,
      [entityType]: filtered
    }));
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    // Update filtered results for all entity types
    Object.keys(entities).forEach(entityType => {
      updateFilteredResults(entityType, entities[entityType], value, statusFilter);
    });
  };

  // Handle status filter change
  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);

    // Update filtered results for all entity types
    Object.keys(entities).forEach(entityType => {
      updateFilteredResults(entityType, entities[entityType], searchTerm, status);
    });
  };

  // Open item details dialog
  const openDetails = (item, entityType) => {
    setSelectedItem(item);
    setCurrentEntityType(entityType);
    setNotes(item.verificationNotes || item.notes || '');
    setIsDialogOpen(true);
  };

  // Prepare for approval action
  const prepareApprove = (item, entityType) => {
    setSelectedItem(item);
    setCurrentEntityType(entityType);
    setCurrentAction('approve');
    setNotes('');
    setIsDialogOpen(true);
  };

  // Prepare for rejection action
  const prepareReject = (item, entityType) => {
    setSelectedItem(item);
    setCurrentEntityType(entityType);
    setCurrentAction('reject');
    setNotes('');
    setIsDialogOpen(true);
  };

  // Handle approval or rejection
  const handleAction = async () => {
    if (!selectedItem || !currentEntityType || !currentAction) return;

    setProcessingAction(true);

    try {
      let endpoint;
      let payload;

      // Prepare request data based on entity type
      if (currentEntityType === 'mosques') {
        endpoint = `/api/admin/mosques/${selectedItem._id}`;
        payload = {
          status: currentAction === 'approve' ? 'approved' : 'rejected',
          verificationNotes: notes
        };
      } else if (currentEntityType === 'volunteers') {
        endpoint = `/api/admin/volunteers/${selectedItem._id}`;
        payload = {
          status: currentAction === 'approve' ? 'approved' : 'rejected',
          notes: notes
        };
      } else if (currentEntityType === 'businesses') {
        endpoint = `/api/admin/businesses/${selectedItem._id}`;
        payload = {
          status: currentAction === 'approve' ? 'approved' : 'rejected',
          notes: notes
        };
      }

      // Send the request
      const response = await axios.patch(endpoint, payload);

      if (response.status === 200) {
        toast({
          title: 'Success',
          description: `${currentEntityType.slice(0, -1).charAt(0).toUpperCase() + currentEntityType.slice(0, -1).slice(1)} ${currentAction === 'approve' ? 'approved' : 'rejected'} successfully.`,
          variant: 'default',
        });

        // Refresh the data
        fetchAllData();
      }
    } catch (error) {
      console.error(`Error ${currentAction}ing ${currentEntityType}:`, error);
      toast({
        title: 'Error',
        description: `Failed to ${currentAction} ${currentEntityType.slice(0, -1)}. Please try again.`,
        variant: 'destructive',
      });
    } finally {
      setProcessingAction(false);
      setIsDialogOpen(false);
      setSelectedItem(null);
      setCurrentEntityType('');
      setCurrentAction('');
      setNotes('');
    }
  };

  // Cancel current action
  const cancelAction = () => {
    setIsDialogOpen(false);
    setSelectedItem(null);
    setCurrentEntityType('');
    setCurrentAction('');
    setNotes('');
  };

  // Show loading spinner while data is loading
  if (loading) {
    return <LoadingSpinner message="Loading admin dashboard..." />;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="flex gap-2">
          <Link href="/admin/mosque-statistics">
            <Button variant="outline" className="flex items-center gap-2">
              <BarChart className="h-4 w-4" />
              Statistics
            </Button>
          </Link>
          <Link href="/admin/mosque-map">
            <Button variant="outline" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Map View
            </Button>
          </Link>
        </div>
      </div>

      {/* Dashboard Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Mosques</CardTitle>
              <Building className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2 text-center my-2">
              <div>
                <div className="text-2xl font-bold">{stats.mosques.total}</div>
                <div className="text-xs text-gray-500">Total</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">{stats.mosques.pending}</div>
                <div className="text-xs text-gray-500">Pending</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{stats.mosques.approved}</div>
                <div className="text-xs text-gray-500">Approved</div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-0">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setActiveTab('mosques')}
            >
              Manage Mosques
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Volunteers</CardTitle>
              <User className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2 text-center my-2">
              <div>
                <div className="text-2xl font-bold">{stats.volunteers.total}</div>
                <div className="text-xs text-gray-500">Total</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">{stats.volunteers.pending}</div>
                <div className="text-xs text-gray-500">Pending</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{stats.volunteers.approved}</div>
                <div className="text-xs text-gray-500">Approved</div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-0">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setActiveTab('volunteers')}
            >
              Manage Volunteers
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Businesses</CardTitle>
              <Store className="h-5 w-5 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2 text-center my-2">
              <div>
                <div className="text-2xl font-bold">{stats.businesses.total}</div>
                <div className="text-xs text-gray-500">Total</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">{stats.businesses.pending}</div>
                <div className="text-xs text-gray-500">Pending</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{stats.businesses.approved}</div>
                <div className="text-xs text-gray-500">Approved</div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-0">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setActiveTab('businesses')}
            >
              Manage Businesses
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Recent Activity Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest approval actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              ...entities.mosques.filter(m => m.status !== 'pending' && m.verifiedAt),
              ...entities.volunteers.filter(v => v.status !== 'pending' && v.reviewedAt),
              ...entities.businesses.filter(b => b.status !== 'pending' && b.verifiedAt)
            ]
              .sort((a, b) => {
                const dateA = new Date(a.verifiedAt || a.reviewedAt);
                const dateB = new Date(b.verifiedAt || b.reviewedAt);
                return dateB - dateA;
              })
              .slice(0, 5)
              .map((item, index) => {
                // Determine type and details
                const isVolunteer = item.skills !== undefined;
                const isBusiness = item.type !== undefined && !isVolunteer;
                const isMosque = !isVolunteer && !isBusiness;

                return (
                  <div key={index} className="flex justify-between items-start border-b pb-3">
                    <div className="flex items-center">
                      {isMosque && <Building className="h-4 w-4 mr-2 text-green-600" />}
                      {isVolunteer && <User className="h-4 w-4 mr-2 text-blue-600" />}
                      {isBusiness && <Store className="h-4 w-4 mr-2 text-purple-600" />}
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <div className="flex items-center text-xs text-gray-500">
                          <StatusBadge status={item.status} />
                          <span className="ml-2">
                            {new Date(item.verifiedAt || item.reviewedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center"
                      onClick={() => openDetails(
                        item,
                        isMosque ? 'mosques' : isVolunteer ? 'volunteers' : 'businesses'
                      )}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Details
                    </Button>
                  </div>
                );
              })}

            {[
              ...entities.mosques.filter(m => m.status !== 'pending' && m.verifiedAt),
              ...entities.volunteers.filter(v => v.status !== 'pending' && v.reviewedAt),
              ...entities.businesses.filter(b => b.status !== 'pending' && b.verifiedAt)
            ].length === 0 && (
              <div className="text-center py-6 text-gray-500">
                No recent activity found
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="mosques" className="flex items-center gap-1">
            Mosques
            {stats.mosques.pending > 0 && (
              <Badge variant="secondary" className="bg-yellow-100">{stats.mosques.pending}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="volunteers" className="flex items-center gap-1">
            Volunteers
            {stats.volunteers.pending > 0 && (
              <Badge variant="secondary" className="bg-yellow-100">{stats.volunteers.pending}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="businesses" className="flex items-center gap-1">
            Businesses
            {stats.businesses.pending > 0 && (
              <Badge variant="secondary" className="bg-yellow-100">{stats.businesses.pending}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab Content */}
        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Pending Approvals</CardTitle>
              <CardDescription>Items awaiting your review</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Pending Mosques */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium flex items-center">
                      <Building className="h-4 w-4 mr-1 text-green-600" />
                      Mosque Registrations
                    </h3>
                    {entities.mosques.filter(m => m.status === 'pending').length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setActiveTab('mosques')}
                      >
                        View All
                      </Button>
                    )}
                  </div>

                  {entities.mosques.filter(m => m.status === 'pending').length > 0 ? (
                    <div className="space-y-2">
                      {entities.mosques
                        .filter(m => m.status === 'pending')
                        .slice(0, 3)
                        .map((mosque, index) => (
                          <div key={index} className="flex justify-between items-center border rounded-md p-2">
                            <div>
                              <p className="font-medium">{mosque.name}</p>
                              <p className="text-xs text-gray-500">{mosque.city}, {mosque.state}</p>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => prepareApprove(mosque, 'mosques')}
                              >
                                <Check className="h-4 w-4 text-green-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => prepareReject(mosque, 'mosques')}
                              >
                                <X className="h-4 w-4 text-red-600" />
                              </Button>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 py-2">No pending mosque registrations</p>
                  )}
                </div>

                {/* Pending Volunteers */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium flex items-center">
                      <User className="h-4 w-4 mr-1 text-blue-600" />
                      Volunteer Applications
                    </h3>
                    {entities.volunteers.filter(v => v.status === 'pending').length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setActiveTab('volunteers')}
                      >
                        View All
                      </Button>
                    )}
                  </div>

                  {entities.volunteers.filter(v => v.status === 'pending').length > 0 ? (
                    <div className="space-y-2">
                      {entities.volunteers
                        .filter(v => v.status === 'pending')
                        .slice(0, 3)
                        .map((volunteer, index) => (
                          <div key={index} className="flex justify-between items-center border rounded-md p-2">
                            <div>
                              <p className="font-medium">{volunteer.name}</p>
                              <div className="flex flex-wrap gap-1">
                                {volunteer.skills?.slice(0, 2).map((skill, i) => (
                                  <Badge key={i} variant="outline" className="text-xs">
                                    {skill}
                                  </Badge>
                                ))}
                                {(volunteer.skills?.length || 0) > 2 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{volunteer.skills.length - 2} more
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => prepareApprove(volunteer, 'volunteers')}
                              >
                                <Check className="h-4 w-4 text-green-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => prepareReject(volunteer, 'volunteers')}
                              >
                                <X className="h-4 w-4 text-red-600" />
                              </Button>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 py-2">No pending volunteer applications</p>
                  )}
                </div>

                {/* Pending Businesses */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium flex items-center">
                      <Store className="h-4 w-4 mr-1 text-purple-600" />
                      Business Registrations
                    </h3>
                    {entities.businesses.filter(b => b.status === 'pending').length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setActiveTab('businesses')}
                      >
                        View All
                      </Button>
                    )}
                  </div>

                  {entities.businesses.filter(b => b.status === 'pending').length > 0 ? (
                    <div className="space-y-2">
                      {entities.businesses
                        .filter(b => b.status === 'pending')
                        .slice(0, 3)
                        .map((business, index) => (
                          <div key={index} className="flex justify-between items-center border rounded-md p-2">
                            <div>
                              <p className="font-medium">{business.name}</p>
                              <p className="text-xs text-gray-500">{business.type}</p>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => prepareApprove(business, 'businesses')}
                              >
                                <Check className="h-4 w-4 text-green-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => prepareReject(business, 'businesses')}
                              >
                                <X className="h-4 w-4 text-red-600" />
                              </Button>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 py-2">No pending business registrations</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Entity-specific Tabs */}
        {['mosques', 'volunteers', 'businesses'].map((entityType) => (
          <TabsContent key={entityType} value={entityType}>
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                  <div>
                    <CardTitle>
                      {entityType.charAt(0).toUpperCase() + entityType.slice(1)} Management
                    </CardTitle>
                    <CardDescription>
                      Review and manage {entityType} registrations and applications
                    </CardDescription>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Input
                      placeholder={`Search ${entityType}...`}
                      value={searchTerm}
                      onChange={handleSearchChange}
                      className="min-w-[200px]"
                    />
                    <div className="flex gap-1">
                      <Button
                        variant={statusFilter === 'all' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleStatusFilterChange('all')}
                      >
                        All
                      </Button>
                      <Button
                        variant={statusFilter === 'pending' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleStatusFilterChange('pending')}
                      >
                        Pending
                      </Button>
                      <Button
                        variant={statusFilter === 'approved' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleStatusFilterChange('approved')}
                      >
                        Approved
                      </Button>
                      <Button
                        variant={statusFilter === 'rejected' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleStatusFilterChange('rejected')}
                      >
                        Rejected
                      </Button>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Entity Tables */}
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        {entityType === 'mosques' && <TableHead>Location</TableHead>}
                        {entityType === 'volunteers' && <TableHead>Skills</TableHead>}
                        {entityType === 'businesses' && <TableHead>Type</TableHead>}
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredResults[entityType].length > 0 ? (
                        filteredResults[entityType].map((item, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{item.name}</TableCell>

                            {/* Entity-specific columns */}
                            {entityType === 'mosques' && (
                              <TableCell>{item.city}, {item.state}</TableCell>
                            )}
                            {entityType === 'volunteers' && (
                              <TableCell>
                                <div className="flex flex-wrap gap-1">
                                  {item.skills?.slice(0, 2).map((skill, i) => (
                                    <Badge key={i} variant="outline">{skill}</Badge>
                                  ))}
                                  {(item.skills?.length || 0) > 2 && (
                                    <Badge variant="outline">+{item.skills.length - 2}</Badge>
                                  )}
                                </div>
                              </TableCell>
                            )}
                            {entityType === 'businesses' && (
                              <TableCell>{item.type}</TableCell>
                            )}

                            <TableCell>
                              <StatusBadge status={item.status} />
                            </TableCell>
                            <TableCell>
                              {new Date(item.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openDetails(item, entityType)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                {item.status === 'pending' && (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-green-600"
                                      onClick={() => prepareApprove(item, entityType)}
                                    >
                                      <Check className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-red-600"
                                      onClick={() => prepareReject(item, entityType)}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </>
                                )}
                                {item.status !== 'pending' && (
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-orange-600"
                                      >
                                        <RefreshCw className="h-4 w-4" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Reset Status</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          This will change the status back to "pending".
                                          Are you sure you want to continue?
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction>Reset Status</AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                            No {entityType} found matching your criteria
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Details/Action Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {currentAction === 'approve'
                ? `Approve ${currentEntityType.slice(0, -1)}`
                : currentAction === 'reject'
                ? `Reject ${currentEntityType.slice(0, -1)}`
                : `${currentEntityType.slice(0, -1).charAt(0).toUpperCase() + currentEntityType.slice(0, -1).slice(1)} Details`}
            </DialogTitle>
            <DialogDescription>
              {currentAction
                ? `Provide any notes before ${currentAction === 'approve' ? 'approving' : 'rejecting'} this ${currentEntityType.slice(0, -1)}.`
                : `Review the details of this ${currentEntityType.slice(0, -1)}.`}
            </DialogDescription>
          </DialogHeader>

          {selectedItem && (
            <div className="py-4">
              <div className="space-y-4">
                {/* Basic Info */}
                <div className="space-y-1">
                  <h3 className="text-sm font-medium">Name:</h3>
                  <p className="text-sm">{selectedItem.name}</p>
                </div>

                {/* Entity-specific details */}
                {currentEntityType === 'mosques' && (
                  <>
                    <div className="space-y-1">
                      <h3 className="text-sm font-medium">Address:</h3>
                      <p className="text-sm">
                        {selectedItem.address}, {selectedItem.city}, {selectedItem.state} {selectedItem.zipCode}
                      </p>
                    </div>
                    {selectedItem.facilityFeatures?.length > 0 && (
                      <div className="space-y-1">
                        <h3 className="text-sm font-medium">Facilities:</h3>
                        <div className="flex flex-wrap gap-1">
                          {selectedItem.facilityFeatures.map((feature, i) => (
                            <Badge key={i} variant="outline">
                              {feature.replace(/-/g, ' ').replace(/\b\w/g, letter => letter.toUpperCase())}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {currentEntityType === 'volunteers' && (
                  <>
                    <div className="space-y-1">
                      <h3 className="text-sm font-medium">Skills:</h3>
                      <div className="flex flex-wrap gap-1">
                        {selectedItem.skills?.map((skill, i) => (
                          <Badge key={i} variant="outline">{skill}</Badge>
                        ))}
                      </div>
                    </div>
                    {selectedItem.availability && (
                      <div className="space-y-1">
                        <h3 className="text-sm font-medium">Availability:</h3>
                        <p className="text-sm">{selectedItem.availability}</p>
                      </div>
                    )}
                  </>
                )}

                {currentEntityType === 'businesses' && (
                  <>
                    <div className="space-y-1">
                      <h3 className="text-sm font-medium">Business Type:</h3>
                      <p className="text-sm">{selectedItem.type}</p>
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-sm font-medium">Location:</h3>
                      <p className="text-sm">
                        {selectedItem.address}, {selectedItem.city}, {selectedItem.state} {selectedItem.zipCode}
                      </p>
                    </div>
                  </>
                )}

                {/* Notes Field */}
                {currentAction ? (
                  <div className="space-y-1">
                    <label htmlFor="notes" className="text-sm font-medium">Notes:</label>
                    <Textarea
                      id="notes"
                      placeholder={`Enter any notes about this ${currentEntityType.slice(0, -1)} (optional)`}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>
                ) : (
                  selectedItem.verificationNotes && (
                    <div className="space-y-1">
                      <h3 className="text-sm font-medium">Verification Notes:</h3>
                      <p className="text-sm bg-gray-50 p-2 rounded-md">
                        {selectedItem.verificationNotes || selectedItem.notes || "No notes provided."}
                      </p>
                    </div>
                  )
                )}

                {/* Status and timestamps */}
                {!currentAction && (
                  <>
                    <div className="space-y-1">
                      <h3 className="text-sm font-medium">Status:</h3>
                      <StatusBadge status={selectedItem.status} />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-sm font-medium">Created:</h3>
                      <p className="text-sm">
                        {new Date(selectedItem.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {(selectedItem.verifiedAt || selectedItem.reviewedAt) && (
                      <div className="space-y-1">
                        <h3 className="text-sm font-medium">Last Updated:</h3>
                        <p className="text-sm">
                          {new Date(selectedItem.verifiedAt || selectedItem.reviewedAt).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            {currentAction ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={cancelAction}
                  disabled={processingAction}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant={currentAction === 'approve' ? 'default' : 'destructive'}
                  onClick={handleAction}
                  disabled={processingAction}
                >
                  {processingAction ? 'Processing...' : currentAction === 'approve' ? 'Approve' : 'Reject'}
                </Button>
              </>
            ) : (
              <Button
                type="button"
                onClick={() => setIsDialogOpen(false)}
              >
                Close
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
