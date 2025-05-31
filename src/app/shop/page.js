'use client';

import { useState, useEffect } from 'react';
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
import {
  Store,
  MapPin,
  Star,
  Eye,
  Search,
  Filter,
  Grid,
  List,
  Clock,
  Phone,
  Globe
} from 'lucide-react';

export default function AllBusinesses() {
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [businesses, setBusinesses] = useState([]);
  const [filteredBusinesses, setFilteredBusinesses] = useState([]);
  
  // Filter and view states
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [cityFilter, setCityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    fetchBusinesses();
  }, []);

  // Filter businesses when search/filter changes
  useEffect(() => {
    let filtered = [...businesses];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(business =>
        business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        business.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        business.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(business => business.category === categoryFilter);
    }

    // City filter
    if (cityFilter !== 'all') {
      filtered = filtered.filter(business => business.contact?.address?.city === cityFilter);
    }

    // Sort businesses
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'featured':
          if (a.featured !== b.featured) return b.featured - a.featured;
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'name':
          return a.name.localeCompare(b.name);
        case 'rating':
          return (b.stats?.averageRating || 0) - (a.stats?.averageRating || 0);
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'popular':
          return (b.stats?.views || 0) - (a.stats?.views || 0);
        default:
          return 0;
      }
    });

    setFilteredBusinesses(filtered);
  }, [businesses, searchTerm, categoryFilter, cityFilter, sortBy]);

  const fetchBusinesses = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/shop');
      setBusinesses(response.data.businesses || []);
    } catch (error) {
      console.error('Error fetching businesses:', error);
      toast({
        title: "Error",
        description: "Failed to load businesses",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getUniqueCategories = () => {
    const categories = [...new Set(businesses.map(b => b.category))];
    return categories.filter(Boolean);
  };

  const getUniqueCities = () => {
    const cities = [...new Set(businesses.map(b => b.contact?.address?.city))];
    return cities.filter(Boolean);
  };

  const isBusinessOpen = (business) => {
    if (!business.hours) return false;
    
    const now = new Date();
    const day = now.toLocaleDateString('en-US', { weekday: 'lowercase' });
    const currentTime = now.toTimeString().slice(0, 5);
    
    const todayHours = business.hours[day];
    if (!todayHours || todayHours.closed) return false;
    
    return currentTime >= todayHours.open && currentTime <= todayHours.close;
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Discover Local Businesses</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Browse and shop from local businesses in your community
          </p>
        </div>

        {/* Filters and Search */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              <div className="flex-1 w-full">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search businesses..."
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
              
              <Select value={cityFilter} onValueChange={setCityFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="City" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cities</SelectItem>
                  {getUniqueCities().map(city => (
                    <SelectItem key={city} value={city}>
                      {city}
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
                  <SelectItem value="name">Name A-Z</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
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
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredBusinesses.length} of {businesses.length} businesses
          </p>
        </div>

        {/* Businesses Grid */}
        {filteredBusinesses.length > 0 ? (
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
              : 'grid-cols-1'
          }`}>
            {filteredBusinesses.map((business) => (
              <Card key={business._id} className="bg-white overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  {business.images?.banner ? (
                    <img
                      src={business.images.banner}
                      alt={business.name}
                      className={`w-full object-cover ${viewMode === 'grid' ? 'h-48' : 'h-32'}`}
                    />
                  ) : (
                    <div className={`w-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center ${viewMode === 'grid' ? 'h-48' : 'h-32'}`}>
                      <Store className="h-12 w-12 text-white" />
                    </div>
                  )}
                  
                  {business.featured && (
                    <Badge className="absolute top-2 left-2 bg-orange-600">
                      Featured
                    </Badge>
                  )}
                  
                  {isBusinessOpen(business) ? (
                    <Badge className="absolute top-2 right-2 bg-green-600">
                      Open Now
                    </Badge>
                  ) : (
                    <Badge className="absolute top-2 right-2" variant="secondary">
                      Closed
                    </Badge>
                  )}
                </div>
                
                <CardContent className="p-4">
                  <div className={`${viewMode === 'list' ? 'flex items-center justify-between' : ''}`}>
                    <div className={`${viewMode === 'list' ? 'flex-1' : ''}`}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {business.images?.logo && (
                            <img
                              src={business.images.logo}
                              alt={business.name}
                              className="w-8 h-8 rounded object-cover"
                            />
                          )}
                          <h3 className="font-bold text-lg line-clamp-1">{business.name}</h3>
                        </div>
                      </div>
                      
                      <p className={`text-gray-600 text-sm mb-3 ${viewMode === 'grid' ? 'line-clamp-2' : 'line-clamp-1'}`}>
                        {business.description}
                      </p>
                      
                      <div className="flex items-center justify-between mb-3">
                        <Badge variant="outline">{business.category}</Badge>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          {business.stats?.averageRating > 0 && (
                            <div className="flex items-center">
                              <Star className="h-4 w-4 text-yellow-500 mr-1" />
                              <span>{business.stats.averageRating.toFixed(1)}</span>
                            </div>
                          )}
                          <div className="flex items-center">
                            <Eye className="h-4 w-4 mr-1" />
                            <span>{business.stats?.views || 0}</span>
                          </div>
                        </div>
                      </div>

                      {business.contact?.address && (
                        <div className="flex items-center text-sm text-gray-600 mb-3">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span>{business.contact.address.city}, {business.contact.address.state}</span>
                        </div>
                      )}

                      <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                        {business.contact?.phone && (
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 mr-1" />
                            <span>Phone</span>
                          </div>
                        )}
                        {business.contact?.website && (
                          <div className="flex items-center">
                            <Globe className="h-4 w-4 mr-1" />
                            <span>Website</span>
                          </div>
                        )}
                        {business.settings?.deliveryAvailable && (
                          <Badge variant="outline" className="text-xs">Delivery</Badge>
                        )}
                      </div>
                      
                      {business.tags && business.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-4">
                          {business.tags.slice(0, 3).map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {business.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{business.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className={`${viewMode === 'list' ? 'ml-4' : ''}`}>
                      <Link href={`/shop/${business._id}`}>
                        <Button className="w-full">
                          <Store className="h-4 w-4 mr-2" />
                          Visit Store
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
            <Store className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No businesses found</h3>
            <p className="text-gray-600">
              {searchTerm || categoryFilter !== 'all' || cityFilter !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'No businesses are currently listed'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}