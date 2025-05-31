'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Clock, 
  Users, 
  Star,
  Eye,
  CheckCircle,
  XCircle,
  Search,
  Filter
} from 'lucide-react';
import axios from 'axios';

export default function AdminBusinessesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session?.user || session.user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }

    fetchBusinesses();
  }, [session, status, router]);

  const fetchBusinesses = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/businesses');
      setBusinesses(response.data.businesses || []);
    } catch (error) {
      console.error('Error fetching businesses:', error);
      toast.error('Failed to fetch businesses');
    } finally {
      setLoading(false);
    }
  };

  const updateBusinessStatus = async (businessId, status) => {
    try {
      setActionLoading(true);
      await axios.patch(`/api/admin/businesses/${businessId}`, { status });
      
      setBusinesses(prev => 
        prev.map(business => 
          business._id === businessId 
            ? { ...business, status: status === 'approved' ? 'verified' : status }
            : business
        )
      );

      toast.success(`Business ${status === 'approved' ? 'approved' : 'rejected'} successfully`);
      setSelectedBusiness(null);
    } catch (error) {
      console.error('Error updating business status:', error);
      toast.error('Failed to update business status');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredBusinesses = businesses.filter(business => {
    const matchesSearch = business.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         business.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         business.category?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const businessStatus = business.status === 'verified' ? 'approved' : business.status;
    const matchesStatus = statusFilter === 'all' || businessStatus === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const displayStatus = status === 'verified' ? 'approved' : status;
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      verified: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      suspended: 'bg-gray-100 text-gray-800'
    };

    return (
      <Badge className={colors[status] || colors.pending}>
        {displayStatus?.charAt(0).toUpperCase() + displayStatus?.slice(1) || 'Pending'}
      </Badge>
    );
  };

  const getStatusCounts = () => {
    return {
      total: businesses.length,
      pending: businesses.filter(b => b.status === 'pending').length,
      approved: businesses.filter(b => b.status === 'verified' || b.status === 'approved').length,
      rejected: businesses.filter(b => b.status === 'rejected').length
    };
  };

  if (status === 'loading' || loading) {
    return (
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  const counts = getStatusCounts();

  return (
    <div className="container mx-auto px-4 py-8 pt-24">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Business Management</h1>
        <p className="text-gray-600">Manage business registrations and applications</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Businesses</p>
                <p className="text-2xl font-bold">{counts.total}</p>
              </div>
              <Building2 className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{counts.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-green-600">{counts.approved}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{counts.rejected}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by business name, email, or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="md:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Businesses List */}
      <Card>
        <CardHeader>
          <CardTitle>Businesses ({filteredBusinesses.length})</CardTitle>
          <CardDescription>
            Review and manage business applications
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredBusinesses.length === 0 ? (
            <div className="text-center py-8">
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No businesses found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBusinesses.map((business) => (
                <div
                  key={business._id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{business.businessName}</h3>
                        {getStatusBadge(business.status)}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          {business.email}
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          {business.phone}
                        </div>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          {business.category}
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {business.address?.city}, {business.address?.state}
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-500 mt-2">
                        Registered: {new Date(business.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedBusiness(business)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Business Details</DialogTitle>
                            <DialogDescription>
                              Review business information and take action
                            </DialogDescription>
                          </DialogHeader>
                          
                          {selectedBusiness && (
                            <div className="space-y-6">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium text-gray-600">Business Name</label>
                                  <p className="text-sm">{selectedBusiness.businessName}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-gray-600">Category</label>
                                  <p className="text-sm">{selectedBusiness.category}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-gray-600">Email</label>
                                  <p className="text-sm">{selectedBusiness.email}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-gray-600">Phone</label>
                                  <p className="text-sm">{selectedBusiness.phone}</p>
                                </div>
                                {selectedBusiness.website && (
                                  <div>
                                    <label className="text-sm font-medium text-gray-600">Website</label>
                                    <p className="text-sm">{selectedBusiness.website}</p>
                                  </div>
                                )}
                                <div>
                                  <label className="text-sm font-medium text-gray-600">Status</label>
                                  <div className="mt-1">
                                    {getStatusBadge(selectedBusiness.status)}
                                  </div>
                                </div>
                              </div>

                              {selectedBusiness.description && (
                                <div>
                                  <label className="text-sm font-medium text-gray-600">Description</label>
                                  <p className="text-sm mt-1">{selectedBusiness.description}</p>
                                </div>
                              )}

                              {selectedBusiness.address && (
                                <div>
                                  <label className="text-sm font-medium text-gray-600">Address</label>
                                  <p className="text-sm mt-1">
                                    {selectedBusiness.address.street}<br />
                                    {selectedBusiness.address.city}, {selectedBusiness.address.state} {selectedBusiness.address.zipCode}
                                  </p>
                                </div>
                              )}

                              {selectedBusiness.operatingHours && (
                                <div>
                                  <label className="text-sm font-medium text-gray-600">Operating Hours</label>
                                  <div className="text-sm mt-1">
                                    {Object.entries(selectedBusiness.operatingHours).map(([day, hours]) => (
                                      <div key={day} className="flex justify-between">
                                        <span className="capitalize">{day}:</span>
                                        <span>{hours.closed ? 'Closed' : `${hours.open} - ${hours.close}`}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {selectedBusiness.status === 'pending' && (
                                <div className="flex gap-4 pt-4 border-t">
                                  <Button
                                    onClick={() => updateBusinessStatus(selectedBusiness._id, 'approved')}
                                    disabled={actionLoading}
                                    className="flex-1"
                                  >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Approve Business
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    onClick={() => updateBusinessStatus(selectedBusiness._id, 'rejected')}
                                    disabled={actionLoading}
                                    className="flex-1"
                                  >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Reject Business
                                  </Button>
                                </div>
                              )}
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>

                      {business.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => updateBusinessStatus(business._id, 'approved')}
                            disabled={actionLoading}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => updateBusinessStatus(business._id, 'rejected')}
                            disabled={actionLoading}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}