'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
} from '@/components/ui/alert-dialog';
import { VolunteerProfileForm } from '@/components/volunteer/VolunteerProfileForm';
import {
  Heart,
  Calendar,
  MapPin,
  Clock,
  User,
  Settings,
  Plus,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  Activity,
  MessageSquare,
  Award,
  TrendingUp,
  Users,
  BookOpen
} from 'lucide-react';

export default function VolunteerDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // State for volunteer data
  const [volunteerStatus, setVolunteerStatus] = useState(null);
  const [applications, setApplications] = useState([]);
  const [offers, setOffers] = useState([]);
  const [profile, setProfile] = useState(null);
  const [activityHistory, setActivityHistory] = useState([]);
  const [stats, setStats] = useState({
    totalApplications: 0,
    acceptedApplications: 0,
    activeOffers: 0,
    totalHours: 0
  });

  // Dialog states
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [offerDialogOpen, setOfferDialogOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);

  // Authentication check
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/dashboard/volunteer");
      return;
    }

    if (status === "authenticated") {
      fetchVolunteerData();
    }
  }, [status, router]);

  const fetchVolunteerData = async () => {
    try {
      setLoading(true);

      // Fetch all volunteer data in parallel
      const [
        statusRes,
        applicationsRes,
        offersRes,
        profileRes,
        activityRes
      ] = await Promise.all([
        axios.get('/api/user/volunteer/status'),
        axios.get('/api/user/volunteer/applications'),
        axios.get('/api/user/volunteer/offers'),
        axios.get('/api/user/volunteer/profile'),
        axios.get('/api/user/volunteer/activity')
      ]);

      setVolunteerStatus(statusRes.data);
      setApplications(applicationsRes.data.applications || []);
      setOffers(offersRes.data.offers || []);
      setProfile(profileRes.data.profile || null);
      setActivityHistory(activityRes.data.activity || []);

      // Calculate stats
      const totalApps = applicationsRes.data.applications?.length || 0;
      const acceptedApps = applicationsRes.data.applications?.filter(app => app.status === 'accepted').length || 0;
      const activeOffers = offersRes.data.offers?.filter(offer => offer.status === 'active').length || 0;
      
      setStats({
        totalApplications: totalApps,
        acceptedApplications: acceptedApps,
        activeOffers: activeOffers,
        totalHours: statusRes.data?.totalHours || 0
      });

    } catch (error) {
      console.error('Error fetching volunteer data:', error);
      toast({
        title: "Error",
        description: "Failed to load volunteer data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOffer = async (offerData) => {
    try {
      await axios.post('/api/user/volunteer/offers', offerData);
      toast({
        title: "Success",
        description: "Volunteer offer created successfully"
      });
      setOfferDialogOpen(false);
      fetchVolunteerData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create volunteer offer",
        variant: "destructive"
      });
    }
  };

  const handleUpdateOffer = async (offerId, offerData) => {
    try {
      await axios.put(`/api/user/volunteer/offers/${offerId}`, offerData);
      toast({
        title: "Success",
        description: "Volunteer offer updated successfully"
      });
      setOfferDialogOpen(false);
      setEditingOffer(null);
      fetchVolunteerData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update volunteer offer",
        variant: "destructive"
      });
    }
  };

  const handleDeleteOffer = async (offerId) => {
    try {
      await axios.delete(`/api/user/volunteer/offers/${offerId}`);
      toast({
        title: "Success",
        description: "Volunteer offer deleted successfully"
      });
      fetchVolunteerData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete volunteer offer",
        variant: "destructive"
      });
    }
  };

  const handleDeactivateVolunteer = async () => {
    try {
      await axios.patch('/api/user/volunteer/status', { status: 'inactive' });
      toast({
        title: "Success",
        description: "Volunteer status deactivated"
      });
      fetchVolunteerData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to deactivate volunteer status",
        variant: "destructive"
      });
    }
  };

  const handleActivateVolunteer = async () => {
    try {
      await axios.patch('/api/user/volunteer/status', { status: 'active' });
      toast({
        title: "Success",
        description: "Volunteer status activated"
      });
      fetchVolunteerData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to activate volunteer status",
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

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'accepted':
        return <Badge variant="default"><CheckCircle className="h-3 w-3 mr-1" />Accepted</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      case 'active':
        return <Badge variant="default"><CheckCircle className="h-3 w-3 mr-1" />Active</Badge>;
      case 'inactive':
        return <Badge variant="secondary"><AlertCircle className="h-3 w-3 mr-1" />Inactive</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-6 pt-24 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Volunteer Dashboard</h1>
          <p className="text-gray-600">Manage your volunteer activities and contributions</p>
        </div>
        <div className="flex space-x-2">
          <Dialog open={profileDialogOpen} onOpenChange={setProfileDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Profile & Settings
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Volunteer Profile & Settings</DialogTitle>
                <DialogDescription>
                  Update your volunteer profile information and preferences
                </DialogDescription>
              </DialogHeader>
              <VolunteerProfileForm 
                profile={profile}
                onSave={(data) => {
                  setProfileDialogOpen(false);
                  fetchVolunteerData();
                }}
                onCancel={() => setProfileDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Status Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Volunteer Status</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              {getStatusBadge(volunteerStatus?.status || 'inactive')}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {volunteerStatus?.status === 'active' ? 'You are an active volunteer' : 'Activate to start volunteering'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Applications</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalApplications}</div>
            <p className="text-xs text-muted-foreground">
              {stats.acceptedApplications} accepted
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Offers</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeOffers}</div>
            <p className="text-xs text-muted-foreground">General offers available</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalHours}</div>
            <p className="text-xs text-muted-foreground">Hours contributed</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="applications">My Applications</TabsTrigger>
          <TabsTrigger value="offers">General Offers</TabsTrigger>
          <TabsTrigger value="activity">Activity History</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Status and Quick Actions */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Volunteer Status & Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">Current Status</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      {getStatusBadge(volunteerStatus?.status || 'inactive')}
                      <span className="text-sm text-gray-600">
                        {volunteerStatus?.status === 'active' 
                          ? `Active since ${new Date(volunteerStatus?.activeSince).toLocaleDateString()}`
                          : 'Not currently active'
                        }
                      </span>
                    </div>
                  </div>
                  <div>
                    {volunteerStatus?.status === 'active' ? (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            Deactivate
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Deactivate Volunteer Status?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will deactivate your volunteer status. You can reactivate it anytime.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDeactivateVolunteer}>
                              Deactivate
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    ) : (
                      <Button onClick={handleActivateVolunteer} size="sm">
                        Activate Volunteer Status
                      </Button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button 
                    variant="outline" 
                    className="h-20 flex flex-col items-center justify-center"
                    onClick={() => setActiveTab('applications')}
                  >
                    <Users className="h-6 w-6 mb-2" />
                    View My Applications
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex flex-col items-center justify-center"
                    onClick={() => setActiveTab('offers')}
                  >
                    <Plus className="h-6 w-6 mb-2" />
                    Manage General Offers
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {activityHistory.slice(0, 5).map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {activity.type === 'application_submitted' && <Users className="h-4 w-4 text-blue-500" />}
                        {activity.type === 'application_accepted' && <CheckCircle className="h-4 w-4 text-green-500" />}
                        {activity.type === 'offer_created' && <Plus className="h-4 w-4 text-purple-500" />}
                        {activity.type === 'offer_updated' && <Edit className="h-4 w-4 text-orange-500" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">{activity.description}</p>
                        <p className="text-xs text-gray-500">{new Date(activity.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                  {activityHistory.length === 0 && (
                    <p className="text-sm text-gray-500">No recent activity</p>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => setActiveTab('activity')}
                >
                  View All Activity
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        {/* Applications Tab */}
        <TabsContent value="applications">
          <Card>
            <CardHeader>
              <CardTitle>My Volunteer Applications</CardTitle>
              <CardDescription>Track your volunteer applications to mosques</CardDescription>
            </CardHeader>
            <CardContent>
              {applications.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mosque</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Applied Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applications.map((application) => (
                      <TableRow key={application._id}>
                        <TableCell className="font-medium">
                          <div>
                            <div>{application.mosqueId?.name || 'N/A'}</div>
                            <div className="text-sm text-gray-500">
                              {application.mosqueId?.address?.city}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{application.category}</Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(application.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(application.status)}
                        </TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No volunteer applications yet</p>
                  <p className="text-sm text-gray-400">Visit mosque pages to apply for volunteer positions</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* General Offers Tab */}
        <TabsContent value="offers">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>My General Volunteer Offers</CardTitle>
                <CardDescription>Manage your general volunteer service offerings</CardDescription>
              </div>
              <Dialog open={offerDialogOpen} onOpenChange={setOfferDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setEditingOffer(null)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Offer
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>
                      {editingOffer ? 'Edit Volunteer Offer' : 'Create New Volunteer Offer'}
                    </DialogTitle>
                  </DialogHeader>
                  <VolunteerOfferForm 
                    offer={editingOffer}
                    onSave={editingOffer ? 
                      (data) => handleUpdateOffer(editingOffer._id, data) : 
                      handleCreateOffer
                    }
                    onCancel={() => {
                      setOfferDialogOpen(false);
                      setEditingOffer(null);
                    }}
                  />
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {offers.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Availability</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {offers.map((offer) => (
                      <TableRow key={offer._id}>
                        <TableCell className="font-medium">
                          <div>
                            <div>{offer.title}</div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {offer.description}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{offer.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {offer.availability?.days?.join(', ')}
                            <br />
                            <span className="text-gray-500">
                              {offer.availability?.timeSlots?.join(', ')}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(offer.status)}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                setEditingOffer(offer);
                                setOfferDialogOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="outline">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Volunteer Offer?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete your volunteer offer.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteOffer(offer._id)}>
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No volunteer offers created yet</p>
                  <p className="text-sm text-gray-400">Create general offers to help the community</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity History Tab */}
        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Activity History</CardTitle>
              <CardDescription>Your complete volunteer activity timeline</CardDescription>
            </CardHeader>
            <CardContent>
              {activityHistory.length > 0 ? (
                <div className="space-y-4">
                  {activityHistory.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-4 p-4 border rounded-lg">
                      <div className="flex-shrink-0 mt-1">
                        {activity.type === 'application_submitted' && <Users className="h-5 w-5 text-blue-500" />}
                        {activity.type === 'application_accepted' && <CheckCircle className="h-5 w-5 text-green-500" />}
                        {activity.type === 'application_rejected' && <XCircle className="h-5 w-5 text-red-500" />}
                        {activity.type === 'offer_created' && <Plus className="h-5 w-5 text-purple-500" />}
                        {activity.type === 'offer_updated' && <Edit className="h-5 w-5 text-orange-500" />}
                        {activity.type === 'profile_updated' && <User className="h-5 w-5 text-blue-500" />}
                        {activity.type === 'status_changed' && <Settings className="h-5 w-5 text-gray-500" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{activity.title || activity.type.replace('_', ' ')}</h4>
                          <span className="text-sm text-gray-500">
                            {new Date(activity.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-600 mt-1">{activity.description}</p>
                        {activity.metadata && (
                          <div className="mt-2 text-sm text-gray-500">
                            {Object.entries(activity.metadata).map(([key, value]) => (
                              <span key={key} className="mr-4">
                                {key}: {value}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No activity history yet</p>
                  <p className="text-sm text-gray-400">Start volunteering to see your activity here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Simple Volunteer Offer Form Component (inline for now)
function VolunteerOfferForm({ offer, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    title: offer?.title || '',
    description: offer?.description || '',
    category: offer?.category || 'general',
    availability: {
      days: offer?.availability?.days || [],
      timeSlots: offer?.availability?.timeSlots || []
    },
    skills: offer?.skills || [],
    status: offer?.status || 'active'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Title</label>
        <input
          type="text"
          className="w-full border rounded-md px-3 py-2"
          value={formData.title}
          onChange={(e) => setFormData({...formData, title: e.target.value})}
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          className="w-full border rounded-md px-3 py-2 h-20"
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Category</label>
        <select
          className="w-full border rounded-md px-3 py-2"
          value={formData.category}
          onChange={(e) => setFormData({...formData, category: e.target.value})}
        >
          <option value="general">General</option>
          <option value="education">Education</option>
          <option value="events">Events</option>
          <option value="maintenance">Maintenance</option>
          <option value="administration">Administration</option>
        </select>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {offer ? 'Update Offer' : 'Create Offer'}
        </Button>
      </DialogFooter>
    </form>
  );
}