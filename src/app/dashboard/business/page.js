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
import { LoadingSpinner } from '@/components/ui/loading-states';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  Store,
  Package,
  DollarSign,
  Eye,
  Star,
  TrendingUp,
  Users,
  ShoppingCart,
  Plus,
  Edit,
  MapPin,
  Clock,
  Settings,
  BarChart3,
  Tags,
  Image
} from 'lucide-react';

export default function BusinessDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [business, setBusiness] = useState(null);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalViews: 0,
    averageRating: 0,
    recentOrders: [],
    topProducts: [],
    monthlyStats: [],
    categoryBreakdown: []
  });
  const [recentProducts, setRecentProducts] = useState([]);
  const [activeOffers, setActiveOffers] = useState([]);

  // Authentication check
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/dashboard/business");
      return;
    }

    if (status === "authenticated" && session?.user?.role !== "business") {
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
    let errorCount = 0;
    const errors = [];

    // 1. Fetch business profile (critical - redirect to registration if not found)
    try {
      const businessRes = await axios.get('/api/business/profile');
      setBusiness(businessRes.data.business);
    } catch (error) {
      console.error('Error fetching business profile:', error);
      
      if (error.response?.status === 404) {
        // No business found, redirect to registration
        router.push('/dashboard/business/register');
        return;
      }
      
      if (error.response?.status === 401) {
        toast({
          title: "Authentication Error",
          description: "Please log in again",
          variant: "destructive"
        });
        router.push('/login');
        return;
      }
      
      errorCount++;
      errors.push('business profile');
    }

    // 2. Fetch analytics (non-critical)
    try {
      const statsRes = await axios.get('/api/business/analytics');
      setStats(statsRes.data.stats || statsRes.data.overview || {});
    } catch (error) {
      errorCount++;
      errors.push('analytics');
      setStats({
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0,
        totalViews: 0,
        averageRating: 0,
        recentOrders: [],
        topProducts: [],
        monthlyStats: [],
        categoryBreakdown: []
      });
    }

    // 3. Fetch products (non-critical)
    try {
      const productsRes = await axios.get('/api/business/products?limit=5&sort=createdAt');
      setRecentProducts(productsRes.data.products || []);
    } catch (error) {
      errorCount++;
      errors.push('products');
      setRecentProducts([]);
    }

    // 4. Fetch offers (non-critical)
    try {
      const offersRes = await axios.get('/api/business/offers?status=active&limit=3');
      setActiveOffers(offersRes.data.offers || []);
    } catch (error) {
      errorCount++;
      errors.push('offers');
      setActiveOffers([]);
    }

    // Show summary toast only for partial failures
    if (errorCount > 0 && errorCount < 4) {
      toast({
        title: "Partial Load",
        description: `Some data couldn't be loaded: ${errors.join(', ')}`,
        variant: "destructive"
      });
    }

  } catch (error) {
    console.error('Error in fetchDashboardData:', error);
    toast({
      title: "Error",
      description: "Failed to load dashboard data",
      variant: "destructive"
    });
  } finally {
    setLoading(false);
  }
};

  const getStatusBadge = (status) => {
    const variants = {
      active: 'default',
      inactive: 'secondary',
      out_of_stock: 'destructive',
      pending: 'secondary',
      verified: 'default',
      rejected: 'destructive'
    };
    
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

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
    <div className="container mx-auto p-6 space-y-6 pt-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Business Dashboard</h1>
          <p className="text-gray-600">
            Welcome back, {business?.name || 'Business Owner'}
          </p>
        </div>
        <div className="flex space-x-2">
          <Link href="/dashboard/business/products/add">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </Link>
          <Link href="/dashboard/business/profile">
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Manage Profile
            </Button>
          </Link>
        </div>
      </div>

      {/* Business Status Alert */}
      {business?.verification?.status === 'pending' && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-orange-600" />
              <div>
                <p className="font-medium text-orange-800">Verification Pending</p>
                <p className="text-sm text-orange-600">
                  Your business is under review. You can still manage products while we verify your information.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              Active products in your store
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              Customer orders received
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue?.toFixed(2) || '0.00'}</div>
            <p className="text-xs text-muted-foreground">
              Revenue generated
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Store Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalViews}</div>
            <p className="text-xs text-muted-foreground">
              Profile page visits
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
<Card>
  <CardHeader>
    <CardTitle>Quick Actions</CardTitle>
    <CardDescription>Manage your business efficiently</CardDescription>
  </CardHeader>
  <CardContent>
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-8 gap-4">
      <Link href="/dashboard/business/products">
        <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
          <Package className="h-6 w-6 mb-2" />
          <span className="text-sm">Products</span>
        </Button>
      </Link>
      
      <Link href="/dashboard/business/offers">
        <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
          <Tags className="h-6 w-6 mb-2" />
          <span className="text-sm">Offers</span>
        </Button>
      </Link>
      
      <Link href="/dashboard/business/profile">
        <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
          <Store className="h-6 w-6 mb-2" />
          <span className="text-sm">Profile</span>
        </Button>
      </Link>
      
      <Link href="/dashboard/business/analytics">
        <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
          <BarChart3 className="h-6 w-6 mb-2" />
          <span className="text-sm">Analytics</span>
        </Button>
      </Link>
      
      <Link href="/dashboard/business/locations">
        <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
          <MapPin className="h-6 w-6 mb-2" />
          <span className="text-sm">Locations</span>
        </Button>
      </Link>
      
      <Link href={`/shop/${business?._id}`} target="_blank">
        <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
          <Eye className="h-6 w-6 mb-2" />
          <span className="text-sm">View Store</span>
        </Button>
      </Link>
      
      <Link href="/dashboard/business/gallery">
        <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
          <Image className="h-6 w-6 mb-2" />
          <span className="text-sm">Gallery</span>
        </Button>
      </Link>

      <Link href="/dashboard/business/announcements">
        <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
          <Users className="h-6 w-6 mb-2" />
          <span className="text-sm">Announcements</span>
        </Button>
      </Link>
    </div>
  </CardContent>
  </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Products & Performance Charts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Products */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Products</CardTitle>
                <CardDescription>Your latest product additions</CardDescription>
              </div>
              <Link href="/dashboard/business/products">
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </CardHeader>
            <CardContent>
              {recentProducts.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Stock</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentProducts.map((product) => (
                      <TableRow key={product._id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gray-200 rounded-md flex items-center justify-center">
                              {product.primaryImage ? (
                                <img 
                                  src={product.primaryImage.url} 
                                  alt={product.name}
                                  className="w-10 h-10 object-cover rounded-md"
                                />
                              ) : (
                                <Package className="h-5 w-5 text-gray-400" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium">{product.name}</p>
                              <p className="text-sm text-gray-500">{product.category}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>${product.price}</TableCell>
                        <TableCell>{getStatusBadge(product.status)}</TableCell>
                        <TableCell>
                          {product.inventory.unlimited ? 'Unlimited' : product.inventory.stock}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No products yet</p>
                  <Link href="/dashboard/business/products/add">
                    <Button className="mt-2">Add Your First Product</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Performance Chart */}
          {stats.monthlyStats && stats.monthlyStats.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Performance Overview</CardTitle>
                <CardDescription>Monthly sales and views</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={stats.monthlyStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="revenue" stroke="#8884d8" name="Revenue ($)" />
                    <Line type="monotone" dataKey="views" stroke="#82ca9d" name="Views" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Business Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Store className="h-5 w-5 mr-2" />
                Business Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="font-medium">{business?.name}</p>
                <p className="text-sm text-gray-600">{business?.category}</p>
              </div>
              
              {business?.contact?.address && (
                <div className="flex items-start space-x-2">
                  <MapPin className="h-4 w-4 mt-0.5 text-gray-400" />
                  <div className="text-sm text-gray-600">
                    <p>{business.contact.address.street}</p>
                    <p>{business.contact.address.city}, {business.contact.address.state}</p>
                  </div>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Status:</span>
                {getStatusBadge(business?.verification?.status || 'pending')}
              </div>
              
              {business?.stats?.averageRating > 0 && (
                <div className="flex items-center space-x-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">{business.stats.averageRating.toFixed(1)} rating</span>
                </div>
              )}
              
              <Link href="/dashboard/business/profile">
                <Button variant="outline" size="sm" className="w-full">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Active Offers */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center">
                  <Tags className="h-5 w-5 mr-2" />
                  Active Offers
                </CardTitle>
              </div>
              <Link href="/dashboard/business/offers">
                <Button variant="outline" size="sm">Manage</Button>
              </Link>
            </CardHeader>
            <CardContent>
              {activeOffers.length > 0 ? (
                <div className="space-y-3">
                  {activeOffers.map((offer) => (
                    <div key={offer._id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-sm">{offer.title}</p>
                        {offer.featured && (
                          <Badge variant="secondary" className="text-xs">Featured</Badge>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>
                          {offer.discountType === 'percentage' ? `${offer.discountValue}% off` : `$${offer.discountValue} off`}
                        </span>
                        <span>{offer.daysRemaining} days left</span>
                      </div>
                      {offer.usageLimit && (
                        <div className="mt-2">
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Used: {offer.usedCount}/{offer.usageLimit}</span>
                            <span>{offer.usagePercentage}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1">
                            <div 
                              className="bg-blue-600 h-1 rounded-full" 
                              style={{ width: `${offer.usagePercentage}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <Tags className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No active offers</p>
                  <Link href="/dashboard/business/offers/add">
                    <Button size="sm" className="mt-2">Create Offer</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Category Breakdown */}
          {stats.categoryBreakdown && stats.categoryBreakdown.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Product Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={stats.categoryBreakdown}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {stats.categoryBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {stats.categoryBreakdown.map((category, index) => (
                    <div key={category._id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        ></div>
                        <span>{category._id}</span>
                      </div>
                      <span>{category.count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}