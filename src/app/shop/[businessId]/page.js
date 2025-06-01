'use client';

import { useState, useEffect, use } from 'react'; // Add 'use' import
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  MapPin,
  Phone,
  Globe,
  Clock,
  Star,
  ShoppingCart,
  Search,
  Filter,
  Heart,
  Share2,
  MessageCircle
} from 'lucide-react';
import axios from 'axios';

// Add this component to handle async params
function BusinessStorefrontContent({ businessId }) {
  const { data: session } = useSession();
  const [business, setBusiness] = useState(null);
  const [products, setProducts] = useState([]);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  useEffect(() => {
    fetchBusinessData();
  }, [businessId]); // Use businessId prop instead of params.businessId

  const fetchBusinessData = async () => {
    try {
      setLoading(true);
      
      const [businessRes, productsRes, offersRes] = await Promise.all([
        axios.get(`/api/shop/${businessId}`), // Use businessId prop
        axios.get(`/api/shop/${businessId}/products`),
        axios.get(`/api/shop/${businessId}/offers`)
      ]);

      setBusiness(businessRes.data.business);
      setProducts(productsRes.data.products || []);
      setOffers(offersRes.data.offers || []);
    } catch (error) {
      console.error('Error fetching business data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Rest of your component logic...
  const isBusinessOpen = (hours) => {
    if (!hours) return false;
    
    const now = new Date();
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase(); // Fix: use 'long' instead of 'lowercase'
    const currentTime = now.toTimeString().slice(0, 5);
    
    const todayHours = hours[currentDay];
    if (!todayHours || todayHours.closed) return false;
    
    return currentTime >= todayHours.open && currentTime <= todayHours.close;
  };

  const getBusinessStatus = () => {
    if (!business) return { text: 'Loading...', color: 'gray' };
    
    const isOpen = isBusinessOpen(business.hours);
    
    if (business.status !== 'active') {
      return { text: 'Temporarily Closed', color: 'red' };
    }
    
    return isOpen 
      ? { text: 'Open Now', color: 'green' }
      : { text: 'Closed', color: 'red' };
  };

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low': return (a.price || 0) - (b.price || 0);
      case 'price-high': return (b.price || 0) - (a.price || 0);
      case 'rating': return (b.rating || 0) - (a.rating || 0);
      case 'name':
      default: return (a.name || '').localeCompare(b.name || '');
    }
  });

  const status = getBusinessStatus();

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="text-center">Loading business...</div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Business Not Found</h1>
          <p className="text-gray-600">The business you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-8 pt-24">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Business Info */}
            <div className="flex-1">
              <div className="flex items-start gap-4 mb-6">
                {business.images?.logo && (
                  <img
                    src={business.images.logo}
                    alt={business.name}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                )}
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{business.name}</h1>
                  <p className="text-gray-600 mb-2">{business.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <Badge 
                      variant={status.color === 'green' ? 'default' : 'secondary'}
                      className={status.color === 'green' ? 'bg-green-100 text-green-800' : 
                                status.color === 'red' ? 'bg-red-100 text-red-800' : ''}
                    >
                      <Clock className="h-3 w-3 mr-1" />
                      {status.text}
                    </Badge>
                    <span className="capitalize">{business.category}</span>
                    {business.stats?.averageRating > 0 && (
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span>{business.stats.averageRating.toFixed(1)}</span>
                        <span>({business.stats.totalReviews} reviews)</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {business.contact?.address && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-gray-400" />
                    <span className="text-sm">
                      {business.contact.address.street}, {business.contact.address.city}, {business.contact.address.state}
                    </span>
                  </div>
                )}
                {business.contact?.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <span className="text-sm">{business.contact.phone}</span>
                  </div>
                )}
                {business.contact?.website && (
                  <div className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-gray-400" />
                    <a href={business.contact.website} target="_blank" rel="noopener noreferrer" 
                       className="text-sm text-blue-600 hover:underline">
                      Visit Website
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="lg:w-80">
              <div className="flex gap-2 mb-4">
                <Button variant="outline" size="sm">
                  <Heart className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
                <Button variant="outline" size="sm">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Contact
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="products">Products ({products.length})</TabsTrigger>
            <TabsTrigger value="offers">Offers ({offers.length})</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-6">
            {/* Search and Filters */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="md:w-48">
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger>
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {[...new Set(products.map(p => p.category))].map(category => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:w-48">
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name">Name A-Z</SelectItem>
                        <SelectItem value="price-low">Price: Low to High</SelectItem>
                        <SelectItem value="price-high">Price: High to Low</SelectItem>
                        <SelectItem value="rating">Highest Rated</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Products Grid */}
            {sortedProducts.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No products found</h3>
                  <p className="text-gray-600">Try adjusting your search or filters.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {sortedProducts.map((product) => (
                  <Card key={product._id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      {product.images?.[0] && (
                        <img
                          src={product.images[0].url}
                          alt={product.name}
                          className="w-full h-48 object-cover rounded-lg mb-4"
                        />
                      )}
                      <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-green-600">
                          ${product.price?.toFixed(2)}
                        </span>
                        <Button size="sm">
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Add to Cart
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Offers Tab */}
          <TabsContent value="offers">
            {offers.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <h3 className="text-lg font-semibold mb-2">No active offers</h3>
                  <p className="text-gray-600">Check back later for special deals and promotions.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {offers.map((offer) => (
                  <Card key={offer._id}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        {offer.title}
                        {offer.featured && <Badge>Featured</Badge>}
                      </CardTitle>
                      <CardDescription>{offer.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-red-600">
                          {offer.discountType === 'percentage' ? `${offer.discountValue}% OFF` : `$${offer.discountValue} OFF`}
                        </span>
                        <Button>Claim Offer</Button>
                      </div>
                      {offer.validUntil && (
                        <p className="text-sm text-gray-500 mt-2">
                          Valid until {new Date(offer.validUntil).toLocaleDateString()}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* About Tab */}
          <TabsContent value="about">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Business Hours</CardTitle>
                </CardHeader>
                <CardContent>
                  {business.hours ? (
                    <div className="space-y-2">
                      {Object.entries(business.hours).map(([day, hours]) => (
                        <div key={day} className="flex justify-between">
                          <span className="capitalize">{day}:</span>
                          <span>
                            {hours.closed ? 'Closed' : `${hours.open} - ${hours.close}`}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600">Hours not available</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {business.contact?.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-5 w-5 text-gray-400" />
                      <span>{business.contact.phone}</span>
                    </div>
                  )}
                  {business.contact?.email && (
                    <div className="flex items-center gap-2">
                      <Globe className="h-5 w-5 text-gray-400" />
                      <span>{business.contact.email}</span>
                    </div>
                  )}
                  {business.contact?.address && (
                    <div className="flex items-start gap-2">
                      <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p>{business.contact.address.street}</p>
                        <p>{business.contact.address.city}, {business.contact.address.state} {business.contact.address.zipCode}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Main component that handles async params
export default function BusinessStorefront({ params }) {
  // Unwrap the async params
  const resolvedParams = use(params);
  
  return <BusinessStorefrontContent businessId={resolvedParams.businessId} />;
}