'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
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
import { LoadingSpinner } from '@/components/ui/loading-states';
import { BusinessMap } from '@/components/business/BusinessMap';
import {
  Store,
  MapPin,
  Phone,
  Mail,
  Globe,
  Clock,
  Star,
  Search,
  Filter,
  Grid,
  List,
  ShoppingCart,
  Eye,
  Tag,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Navigation,
  Calendar
} from 'lucide-react';

export default function BusinessStorefront({ params }) {
  const router = useRouter();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [business, setBusiness] = useState(null);
  const [products, setProducts] = useState([]);
  const [offers, setOffers] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  
  // Filter and view states
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [viewMode, setViewMode] = useState('grid');
  const [showOffers, setShowOffers] = useState(false);

  useEffect(() => {
    fetchBusinessData();
  }, [params.businessId]);

  // Filter products when search/filter changes
  useEffect(() => {
    let filtered = [...products];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(product => product.category === categoryFilter);
    }

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'featured':
          if (a.featured !== b.featured) return b.featured - a.featured;
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'price_low':
          return a.price - b.price;
        case 'price_high':
          return b.price - a.price;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        default:
          return 0;
      }
    });

    setFilteredProducts(filtered);
  }, [products, searchTerm, categoryFilter, sortBy]);

  const fetchBusinessData = async () => {
    try {
      setLoading(true);
      
      const [businessRes, productsRes, offersRes] = await Promise.all([
        axios.get(`/api/shop/${params.businessId}`),
        axios.get(`/api/shop/${params.businessId}/products`),
        axios.get(`/api/shop/${params.businessId}/offers`)
      ]);

      setBusiness(businessRes.data.business);
      setProducts(productsRes.data.products || []);
      setOffers(offersRes.data.offers || []);

    } catch (error) {
      console.error('Error fetching business data:', error);
      toast({
        title: "Error",
        description: "Failed to load store information",
        variant: "destructive"
      });
      
      if (error.response?.status === 404) {
        router.push('/shop');
      }
    } finally {
      setLoading(false);
    }
  };

  const getUniqueCategories = () => {
    const categories = [...new Set(products.map(p => p.category))];
    return categories.filter(Boolean);
  };

  const isBusinessOpen = () => {
    if (!business?.hours) return false;
    
    const now = new Date();
    const day = now.toLocaleDateString('en-US', { weekday: 'lowercase' });
    const currentTime = now.toTimeString().slice(0, 5);
    
    const todayHours = business.hours[day];
    if (!todayHours || todayHours.closed) return false;
    
    return currentTime >= todayHours.open && currentTime <= todayHours.close;
  };

  const getBusinessStatus = () => {
    if (isBusinessOpen()) {
      return <Badge variant="default" className="bg-green-600">Open Now</Badge>;
    } else {
      return <Badge variant="secondary">Closed</Badge>;
    }
  };

  const handleProductView = async (productId) => {
    try {
      // Track product view
      await axios.post(`/api/shop/${params.businessId}/products/${productId}/view`);
    } catch (error) {
      console.error('Error tracking product view:', error);
    }
  };

  const getDirectionsUrl = () => {
    if (!business?.contact?.address) return '#';
    
    const address = business.contact.address;
    const query = encodeURIComponent(`${address.street}, ${address.city}, ${address.state} ${address.zipCode}`);
    return `https://www.google.com/maps/dir/?api=1&destination=${query}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <LoadingSpinner />
          </div>
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto p-6">
          <div className="text-center py-12">
            <Store className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Store Not Found</h1>
            <p className="text-gray-600 mb-6">The store you're looking for doesn't exist or is no longer available.</p>
            <Link href="/shop">
              <Button>Browse All Stores</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Business Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Business Info */}
            <div className="lg:col-span-2">
              <div className="flex items-start space-x-4">
                {business.images?.logo && (
                  <img
                    src={business.images.logo}
                    alt={business.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                )}
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h1 className="text-3xl font-bold text-gray-900">{business.name}</h1>
                    {getBusinessStatus()}
                  </div>
                  
                  <p className="text-gray-600 mb-3">{business.description}</p>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Badge variant="outline">{business.category}</Badge>
                    </div>
                    
                    {business.stats?.averageRating > 0 && (
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-500 mr-1" />
                        <span>{business.stats.averageRating.toFixed(1)}</span>
                        <span className="ml-1">({business.stats.totalReviews} reviews)</span>
                      </div>
                    )}
                    
                    <div className="flex items-center">
                      <Eye className="h-4 w-4 mr-1" />
                      <span>{business.stats?.views || 0} views</span>
                    </div>
                  </div>

                  {/* Tags */}
                  {business.tags && business.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {business.tags.slice(0, 5).map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Contact & Hours */}
            <div className="space-y-4">
              {/* Contact Info */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {business.contact?.address && (
                    <div className="flex items-start space-x-2">
                      <MapPin className="h-4 w-4 mt-0.5 text-gray-400" />
                      <div className="text-sm">
                        <p>{business.contact.address.street}</p>
                        <p>{business.contact.address.city}, {business.contact.address.state} {business.contact.address.zipCode}</p>
                      </div>
                    </div>
                  )}
                  
                  {business.contact?.phone && (
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <a href={`tel:${business.contact.phone}`} className="text-sm hover:text-blue-600">
                        {business.contact.phone}
                      </a>
                    </div>
                  )}
                  
                  {business.contact?.email && (
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <a href={`mailto:${business.contact.email}`} className="text-sm hover:text-blue-600">
                        {business.contact.email}
                      </a>
                    </div>
                  )}
                  
                  {business.contact?.website && (
                    <div className="flex items-center space-x-2">
                      <Globe className="h-4 w-4 text-gray-400" />
                      <a 
                        href={business.contact.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm hover:text-blue-600"
                      >
                        Visit Website
                      </a>
                    </div>
                  )}

                  {business.contact?.address && (
                    <div className="pt-2">
                      <a
                        href={getDirectionsUrl()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700"
                      >
                        <Navigation className="h-4 w-4 mr-1" />
                        Get Directions
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Business Hours */}
              {business.hours && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      Business Hours
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1">
                    {Object.entries(business.hours).map(([day, hours]) => (
                      <div key={day} className="flex justify-between text-sm">
                        <span className="capitalize font-medium">{day}</span>
                        <span className="text-gray-600">
                          {hours.closed ? 'Closed' : `${hours.open} - ${hours.close}`}
                        </span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Social Media */}
              {(business.socialMedia?.facebook || business.socialMedia?.instagram || 
                business.socialMedia?.twitter || business.socialMedia?.linkedin) && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Follow Us</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex space-x-3">
                      {business.socialMedia.facebook && (
                        <a
                          href={business.socialMedia.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Facebook className="h-5 w-5" />
                        </a>
                      )}
                      {business.socialMedia.instagram && (
                        <a
                          href={business.socialMedia.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-pink-600 hover:text-pink-700"
                        >
                          <Instagram className="h-5 w-5" />
                        </a>
                      )}
                      {business.socialMedia.twitter && (
                        <a
                          href={business.socialMedia.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-500"
                        >
                          <Twitter className="h-5 w-5" />
                        </a>
                      )}
                      {business.socialMedia.linkedin && (
                        <a
                          href={business.socialMedia.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-700 hover:text-blue-800"
                        >
                          <Linkedin className="h-5 w-5" />
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Map Section */}
      {business.contact?.address && (
        <div className="bg-white border-b">
          <div className="container mx-auto p-6">
            <div className="h-64 rounded-lg overflow-hidden">
              <BusinessMap
                address={business.contact.address}
                coordinates={business.contact.address.coordinates}
                interactive={false}
              />
            </div>
          </div>
        </div>
      )}

      {/* Featured Offers */}
      {offers.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
          <div className="container mx-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Special Offers</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowOffers(!showOffers)}
              >
                {showOffers ? 'Hide' : 'Show All'} Offers
              </Button>
            </div>
            
            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${showOffers ? '' : 'lg:grid-cols-4'}`}>
              {(showOffers ? offers : offers.slice(0, 3)).map((offer) => (
                <Card key={offer._id} className="bg-white border-2 border-orange-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="default" className="bg-orange-600">
                        {offer.discountType === 'percentage' ? `${offer.discountValue}% OFF` : `$${offer.discountValue} OFF`}
                      </Badge>
                      {offer.featured && <Star className="h-4 w-4 text-yellow-500" />}
                    </div>
                    <h3 className="font-semibold mb-1">{offer.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{offer.description}</p>
                    {offer.code && (
                      <div className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                        Code: {offer.code}
                      </div>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      Valid until {new Date(offer.validTo).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Products Section */}
      <div className="container mx-auto p-6">
        {/* Filters and Search */}
        <div className="bg-white rounded-lg border p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 w-full">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {getUniqueCategories().map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="name">Name A-Z</SelectItem>
                <SelectItem value="price_low">Price Low-High</SelectItem>
                <SelectItem value="price_high">Price High-Low</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex border rounded-lg">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
              : 'grid-cols-1'
          }`}>
            {filteredProducts.map((product) => (
              <Card key={product._id} className="bg-white overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  {product.primaryImage ? (
                    <img
                      src={product.primaryImage.url}
                      alt={product.name}
                      className={`w-full object-cover ${viewMode === 'grid' ? 'h-48' : 'h-32'}`}
                    />
                  ) : (
                    <div className={`w-full bg-gray-200 flex items-center justify-center ${viewMode === 'grid' ? 'h-48' : 'h-32'}`}>
                      <Tag className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                  
                  {product.featured && (
                    <Badge className="absolute top-2 left-2 bg-orange-600">
                      Featured
                    </Badge>
                  )}
                  
                  {product.discountPercentage > 0 && (
                    <Badge className="absolute top-2 right-2 bg-red-600">
                      {product.discountPercentage}% OFF
                    </Badge>
                  )}
                </div>
                
                <CardContent className="p-4">
                  <div className={`${viewMode === 'list' ? 'flex items-center justify-between' : ''}`}>
                    <div className={`${viewMode === 'list' ? 'flex-1' : ''}`}>
                      <h3 className="font-semibold mb-1 line-clamp-2">{product.name}</h3>
                      <p className={`text-gray-600 text-sm mb-2 ${viewMode === 'grid' ? 'line-clamp-3' : 'line-clamp-2'}`}>
                        {product.description}
                      </p>
                      
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <span className="text-lg font-bold text-gray-900">${product.price}</span>
                          {product.compareAtPrice && (
                            <span className="text-sm text-gray-500 line-through ml-2">
                              ${product.compareAtPrice}
                            </span>
                          )}
                        </div>
                        <Badge variant="outline">{product.category}</Badge>
                      </div>
                      
                      {product.tags && product.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {product.tags.slice(0, 3).map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className={`${viewMode === 'list' ? 'ml-4' : ''}`}>
                      <Link href={`/shop/${params.businessId}/product/${product._id}`}>
                        <Button 
                          className="w-full"
                          onClick={() => handleProductView(product._id)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Tag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600">
              {searchTerm || categoryFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'This store hasn\'t added any products yet'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}