'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
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
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { LoadingSpinner } from '@/components/ui/loading-states';
import {
  ArrowLeft,
  Tags,
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Star,
  Calendar,
  Percent,
  DollarSign,
  TrendingUp,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';

export default function OffersManagement() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [offers, setOffers] = useState([]);
  const [filteredOffers, setFilteredOffers] = useState([]);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    expired: 0,
    featured: 0,
    totalUsage: 0
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/dashboard/business/offers");
      return;
    }

    if (status === "authenticated" && session?.user?.role !== "business") {
      router.push("/unauthorized");
      return;
    }

    if (status === "authenticated") {
      fetchOffers();
    }
  }, [status, session, router]);

  // Filter offers when search/filter changes
  useEffect(() => {
    let filtered = [...offers];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(offer =>
        offer.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        offer.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        offer.code?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(offer => offer.status === statusFilter);
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(offer => offer.discountType === typeFilter);
    }

    setFilteredOffers(filtered);
  }, [offers, searchTerm, statusFilter, typeFilter]);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      
      const [offersRes, statsRes] = await Promise.all([
        axios.get('/api/business/offers'),
        axios.get('/api/business/offers/stats')
      ]);

      setOffers(offersRes.data.offers || []);
      setStats(statsRes.data.stats || stats);

    } catch (error) {
      console.error('Error fetching offers:', error);
      toast({
        title: "Error",
        description: "Failed to load offers",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOffer = async (offerId) => {
    try {
      await axios.delete(`/api/business/offers/${offerId}`);
      
      toast({
        title: "Success",
        description: "Offer deleted successfully"
      });
      
      fetchOffers();
    } catch (error) {
      console.error('Error deleting offer:', error);
      toast({
        title: "Error",
        description: "Failed to delete offer",
        variant: "destructive"
      });
    }
  };

  const handleToggleStatus = async (offerId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    
    try {
      await axios.patch(`/api/business/offers/${offerId}`, { status: newStatus });
      
      toast({
        title: "Success",
        description: `Offer ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`
      });
      
      fetchOffers();
    } catch (error) {
      console.error('Error updating offer status:', error);
      toast({
        title: "Error",
        description: "Failed to update offer status",
        variant: "destructive"
      });
    }
  };

  const handleToggleFeatured = async (offerId, currentFeatured) => {
    try {
      await axios.patch(`/api/business/offers/${offerId}`, { featured: !currentFeatured });
      
      toast({
        title: "Success",
        description: `Offer ${!currentFeatured ? 'featured' : 'unfeatured'} successfully`
      });
      
      fetchOffers();
    } catch (error) {
      console.error('Error updating offer featured status:', error);
      toast({
        title: "Error",
        description: "Failed to update offer",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (offer) => {
    const now = new Date();
    const validTo = new Date(offer.validTo);
    const validFrom = new Date(offer.validFrom);

    if (offer.status === 'inactive') {
      return <Badge variant="secondary">Inactive</Badge>;
    }
    
    if (now > validTo) {
      return <Badge variant="destructive">Expired</Badge>;
    }
    
    if (now < validFrom) {
      return <Badge variant="outline">Scheduled</Badge>;
    }
    
    if (offer.usageLimit && offer.usedCount >= offer.usageLimit) {
      return <Badge variant="destructive">Limit Reached</Badge>;
    }
    
    return <Badge variant="default">Active</Badge>;
  };

  const getDiscountDisplay = (offer) => {
    switch (offer.discountType) {
      case 'percentage':
        return `${offer.discountValue}% off`;
      case 'fixed_amount':
        return `$${offer.discountValue} off`;
      case 'free_shipping':
        return 'Free shipping';
      case 'buy_one_get_one':
        return 'BOGO';
      default:
        return offer.discountType;
    }
  };

  const getDaysRemaining = (validTo) => {
    const now = new Date();
    const endDate = new Date(validTo);
    const timeDiff = endDate.getTime() - now.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return daysDiff;
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

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => router.push('/dashboard/business')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Offers Management</h1>
            <p className="text-gray-600">Create and manage promotional offers</p>
          </div>
        </div>
        <Link href="/dashboard/business/offers/add">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Offer
          </Button>
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Offers</CardTitle>
            <Tags className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">All offers created</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Offers</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <p className="text-xs text-muted-foreground">Currently running</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expired Offers</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.expired}</div>
            <p className="text-xs text-muted-foreground">Past expiration</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Featured Offers</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.featured}</div>
            <p className="text-xs text-muted-foreground">Highlighted offers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usage</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsage}</div>
            <p className="text-xs text-muted-foreground">Times offers used</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Promotional Offers</CardTitle>
          <CardDescription>Manage your promotional campaigns and discounts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search offers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="percentage">Percentage</SelectItem>
                <SelectItem value="fixed_amount">Fixed Amount</SelectItem>
                <SelectItem value="free_shipping">Free Shipping</SelectItem>
                <SelectItem value="buy_one_get_one">BOGO</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Offers Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Offer</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Valid Period</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOffers.length > 0 ? (
                  filteredOffers.map((offer) => (
                    <TableRow key={offer._id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div>
                            <div className="flex items-center space-x-2">
                              <p className="font-medium">{offer.title}</p>
                              {offer.featured && (
                                <Star className="h-4 w-4 text-yellow-500" />
                              )}
                            </div>
                            <p className="text-sm text-gray-500 truncate max-w-xs">
                              {offer.description}
                            </p>
                            {offer.code && (
                              <Badge variant="outline" className="text-xs mt-1">
                                Code: {offer.code}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          {offer.discountType === 'percentage' ? (
                            <Percent className="h-4 w-4 text-green-600" />
                          ) : (
                            <DollarSign className="h-4 w-4 text-green-600" />
                          )}
                          <span className="font-medium">{getDiscountDisplay(offer)}</span>
                        </div>
                        {offer.minimumPurchase > 0 && (
                          <p className="text-xs text-gray-500">
                            Min: ${offer.minimumPurchase}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">
                            {new Date(offer.validFrom).toLocaleDateString()} - {new Date(offer.validTo).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-500">
                            {getDaysRemaining(offer.validTo) > 0 
                              ? `${getDaysRemaining(offer.validTo)} days left`
                              : 'Expired'
                            }
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          {offer.usageLimit ? (
                            <div>
                              <p className="text-sm">{offer.usedCount} / {offer.usageLimit}</p>
                              <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                                <div 
                                  className="bg-blue-600 h-1 rounded-full" 
                                  style={{ 
                                    width: `${Math.min((offer.usedCount / offer.usageLimit) * 100, 100)}%` 
                                  }}
                                ></div>
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm">{offer.usedCount} uses</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(offer)}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <Link href={`/dashboard/business/offers/${offer._id}`}>
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                            </Link>
                            <Link href={`/dashboard/business/offers/${offer._id}/edit`}>
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Offer
                              </DropdownMenuItem>
                            </Link>
                            <DropdownMenuItem 
                              onClick={() => handleToggleStatus(offer._id, offer.status)}
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              {offer.status === 'active' ? 'Deactivate' : 'Activate'}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleToggleFeatured(offer._id, offer.featured)}
                            >
                              <Star className="mr-2 h-4 w-4" />
                              {offer.featured ? 'Unfeature' : 'Feature'}
                            </DropdownMenuItem>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem 
                                  className="text-red-600"
                                  onSelect={(e) => e.preventDefault()}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete Offer
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Offer</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "{offer.title}"? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    className="bg-red-600 hover:bg-red-700"
                                    onClick={() => handleDeleteOffer(offer._id)}
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex flex-col items-center">
                        <Tags className="h-12 w-12 text-gray-400 mb-4" />
                        <p className="text-gray-500">No offers found</p>
                        {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' ? (
                          <p className="text-sm text-gray-400">Try adjusting your search or filter criteria</p>
                        ) : (
                          <Link href="/dashboard/business/offers/add">
                            <Button className="mt-4">Create Your First Offer</Button>
                          </Link>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}