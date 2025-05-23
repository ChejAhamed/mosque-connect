'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';
import {
  Check, X, Eye, MapPin, AlertTriangle, Clock, Building
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadingSpinner } from '@/components/ui/loading-states';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

export default function AdminMosquesPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { toast } = useToast();
  const [mosques, setMosques] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedMosque, setSelectedMosque] = useState(null);
  const [notes, setNotes] = useState('');
  const [processingAction, setProcessingAction] = useState(false);
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0
  });

  useEffect(() => {
    // Check authentication and authorization
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/admin/mosques');
      return;
    }

    if (status === 'authenticated' && session.user.role !== 'admin') {
      router.push('/unauthorized');
      return;
    }

    // Fetch mosques when authenticated
    if (status === 'authenticated') {
      fetchMosques();
    }
  }, [status, session, router]);

  // Function to fetch all mosques
  const fetchMosques = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/mosques');
      const allMosques = response.data.mosques;

      // Calculate stats
      const pendingCount = allMosques.filter(m => m.status === 'pending').length;
      const approvedCount = allMosques.filter(m => m.status === 'approved').length;
      const rejectedCount = allMosques.filter(m => m.status === 'rejected').length;

      setMosques(allMosques);
      setStats({
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount,
        total: allMosques.length
      });
    } catch (error) {
      console.error('Error fetching mosques:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch mosque data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Function to update mosque status
  const updateMosqueStatus = async (mosqueId, status) => {
    try {
      setProcessingAction(true);

      const response = await axios.patch(`/api/admin/mosques/${mosqueId}`, {
        status,
        verificationNotes: notes,
        verifiedAt: new Date().toISOString(),
        verifiedBy: session.user.id
      });

      // Update local state
      setMosques(prevMosques => prevMosques.map(mosque =>
        mosque._id === mosqueId ? { ...mosque, status, verificationNotes: notes } : mosque
      ));

      // Update stats
      if (status === 'approved') {
        setStats(prev => ({
          ...prev,
          pending: prev.pending - 1,
          approved: prev.approved + 1
        }));
      } else if (status === 'rejected') {
        setStats(prev => ({
          ...prev,
          pending: prev.pending - 1,
          rejected: prev.rejected + 1
        }));
      }

      toast({
        title: 'Success',
        description: `Mosque has been ${status}`,
        variant: 'default',
      });

      // Reset selected mosque and notes
      setSelectedMosque(null);
      setNotes('');
    } catch (error) {
      console.error(`Error ${status} mosque:`, error);
      toast({
        title: 'Error',
        description: `Failed to ${status} mosque. Please try again.`,
        variant: 'destructive',
      });
    } finally {
      setProcessingAction(false);
    }
  };

  // Filtered mosques based on active tab
  const filteredMosques = mosques.filter(mosque => mosque.status === activeTab);

  if (status === 'loading' || loading) {
    return <LoadingSpinner message="Loading mosques..." />;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Mosque Management</h1>
        <Link href="/admin/dashboard">
          <Button variant="outline">Back to Dashboard</Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatsCard
          title="Total Mosques"
          value={stats.total}
          icon={<Building className="h-5 w-5 text-gray-600" />}
          color="bg-gray-100"
        />
        <StatsCard
          title="Pending Approval"
          value={stats.pending}
          icon={<Clock className="h-5 w-5 text-yellow-600" />}
          color="bg-yellow-100"
        />
        <StatsCard
          title="Approved"
          value={stats.approved}
          icon={<Check className="h-5 w-5 text-green-600" />}
          color="bg-green-100"
        />
        <StatsCard
          title="Rejected"
          value={stats.rejected}
          icon={<X className="h-5 w-5 text-red-600" />}
          color="bg-red-100"
        />
      </div>

      {/* Tabs for different mosque statuses */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="pending" className="relative">
            Pending
            {stats.pending > 0 && (
              <Badge className="ml-2 bg-yellow-500 absolute -top-2 -right-2">
                {stats.pending}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {filteredMosques.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-gray-500">No pending mosque approvals</p>
              </CardContent>
            </Card>
          ) : (
            filteredMosques.map(mosque => (
              <MosqueCard
                key={mosque._id}
                mosque={mosque}
                onViewDetails={() => setSelectedMosque(mosque)}
                status="pending"
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          {filteredMosques.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-gray-500">No approved mosques</p>
              </CardContent>
            </Card>
          ) : (
            filteredMosques.map(mosque => (
              <MosqueCard
                key={mosque._id}
                mosque={mosque}
                onViewDetails={() => setSelectedMosque(mosque)}
                status="approved"
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4">
          {filteredMosques.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-gray-500">No rejected mosques</p>
              </CardContent>
            </Card>
          ) : (
            filteredMosques.map(mosque => (
              <MosqueCard
                key={mosque._id}
                mosque={mosque}
                onViewDetails={() => setSelectedMosque(mosque)}
                status="rejected"
              />
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Mosque Detail Dialog */}
      {selectedMosque && (
        <Dialog open={!!selectedMosque} onOpenChange={(open) => !open && setSelectedMosque(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedMosque.name}</DialogTitle>
              <DialogDescription>
                Review mosque information before approval
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div>
                <h4 className="font-medium text-gray-700 mb-1">Address</h4>
                <p className="text-sm text-gray-600">{selectedMosque.address}</p>
                <p className="text-sm text-gray-600">{selectedMosque.city}, {selectedMosque.state} {selectedMosque.zipCode}</p>
              </div>

              <div>
                <h4 className="font-medium text-gray-700 mb-1">Contact</h4>
                <p className="text-sm text-gray-600">{selectedMosque.phone || 'No phone provided'}</p>
                <p className="text-sm text-gray-600">{selectedMosque.email || 'No email provided'}</p>
              </div>

              <div className="md:col-span-2">
                <h4 className="font-medium text-gray-700 mb-1">Description</h4>
                <p className="text-sm text-gray-600">{selectedMosque.description || 'No description provided'}</p>
              </div>

              <div className="md:col-span-2">
                <h4 className="font-medium text-gray-700 mb-1">Facilities</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedMosque.facilityFeatures?.length > 0 ? (
                    selectedMosque.facilityFeatures.map((feature, index) => (
                      <Badge key={index} variant="secondary">
                        {feature.replace(/-/g, ' ')}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No facilities listed</p>
                  )}
                </div>
              </div>
            </div>

            {selectedMosque.status === 'pending' && (
              <>
                <div className="mb-4">
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                    Verification Notes (optional)
                  </label>
                  <Textarea
                    id="notes"
                    placeholder="Add any notes about this mosque verification"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full"
                  />
                </div>

                <DialogFooter className="flex justify-between">
                  <Button
                    variant="destructive"
                    onClick={() => updateMosqueStatus(selectedMosque._id, 'rejected')}
                    disabled={processingAction}
                  >
                    {processingAction ? 'Processing...' : 'Reject Mosque'}
                  </Button>
                  <div className="space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedMosque(null);
                        setNotes('');
                      }}
                      disabled={processingAction}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="default"
                      onClick={() => updateMosqueStatus(selectedMosque._id, 'approved')}
                      disabled={processingAction}
                    >
                      {processingAction ? 'Processing...' : 'Approve Mosque'}
                    </Button>
                  </div>
                </DialogFooter>
              </>
            )}

            {selectedMosque.status !== 'pending' && (
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setSelectedMosque(null)}
                >
                  Close
                </Button>
                <Link href={`/mosques/${selectedMosque._id}`} target="_blank">
                  <Button variant="default">
                    View Public Page
                  </Button>
                </Link>
              </DialogFooter>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// Stats Card Component
function StatsCard({ title, value, icon, color }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <h3 className="text-2xl font-bold mt-1">{value}</h3>
          </div>
          <div className={`${color} p-3 rounded-full`}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}

// Mosque Card Component
function MosqueCard({ mosque, onViewDetails, status }) {
  const statusIcons = {
    pending: <Clock className="h-5 w-5 text-yellow-500" />,
    approved: <Check className="h-5 w-5 text-green-500" />,
    rejected: <X className="h-5 w-5 text-red-500" />
  };

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800'
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="p-6">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="text-lg font-semibold">{mosque.name}</h3>
              <div className="flex items-center text-gray-500 text-sm">
                <MapPin className="h-3.5 w-3.5 mr-1" />
                <span>{mosque.city}, {mosque.state}</span>
              </div>
            </div>
            <Badge className={statusColors[status]}>
              <span className="flex items-center">
                {statusIcons[status]}
                <span className="ml-1">
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </span>
              </span>
            </Badge>
          </div>

          <div className="text-sm text-gray-600 line-clamp-2 mb-3">
            {mosque.description || 'No description provided.'}
          </div>

          <div className="flex flex-wrap gap-1 mb-4">
            {mosque.facilityFeatures?.slice(0, 3).map((feature, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {feature.replace(/-/g, ' ')}
              </Badge>
            ))}
            {(mosque.facilityFeatures?.length || 0) > 3 && (
              <Badge variant="outline" className="text-xs">
                +{mosque.facilityFeatures.length - 3} more
              </Badge>
            )}
          </div>
        </div>

        <div className="border-t px-6 py-3 bg-gray-50 flex justify-between items-center">
          <div className="text-xs text-gray-500">
            Added: {new Date(mosque.createdAt).toLocaleDateString()}
          </div>
          <Button size="sm" variant="ghost" onClick={onViewDetails}>
            <Eye className="h-4 w-4 mr-1" /> View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
