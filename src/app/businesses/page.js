"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BUSINESS_TYPES, BUSINESS_TYPE_LABELS } from "@/lib/constants";
import {
  MapPin,
  Phone,
  Globe,
  Star,
  Verified,
  Building2,
  Search,
  Filter,
  Loader2
} from "lucide-react";
import axios from "axios";

export default function BusinessesPage() {
  const [businesses, setBusinesses] = useState([]);
  const [featuredBusinesses, setFeaturedBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  useEffect(() => {
    fetchBusinesses();
  }, []);

  useEffect(() => {
    // Re-fetch when filters change
    fetchBusinesses();
  }, [searchTerm, locationFilter, typeFilter, verifiedOnly]);

  const fetchBusinesses = async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query parameters
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (locationFilter) params.append('location', locationFilter);
      if (typeFilter && typeFilter !== 'all') params.append('category', typeFilter);
      if (verifiedOnly) params.append('verified', 'true');

      console.log('Fetching businesses with params:', params.toString());

      const response = await axios.get(`/api/businesses?${params.toString()}`);
      const allBusinesses = response.data.businesses || [];
      
      setBusinesses(allBusinesses);
      
      // Filter featured businesses
      const featured = allBusinesses.filter(business => business.isFeatured && business.isVerified);
      setFeaturedBusinesses(featured);

      console.log('Fetched businesses:', allBusinesses.length);
      console.log('Featured businesses:', featured.length);

    } catch (error) {
      console.error('Error fetching businesses:', error);
      setError(error.response?.data?.error || 'Failed to load businesses');
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setLocationFilter("");
    setTypeFilter("all");
    setVerifiedOnly(false);
  };

  if (error) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Businesses</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={fetchBusinesses}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4 pt-24">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-4">Halal Business Directory</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Discover local halal-certified businesses and services in your community.
        </p>
      </div>

      {/* Search and filters */}
      <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search businesses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="relative">
          <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Filter by location..."
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="pl-10"
          />
        </div>
        <div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger>
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Business type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {BUSINESS_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {BUSINESS_TYPE_LABELS[type] || type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="verified-only"
            checked={verifiedOnly}
            onChange={(e) => setVerifiedOnly(e.target.checked)}
            className="rounded border-gray-300"
          />
          <label htmlFor="verified-only" className="text-sm">
            Halal Verified Only
          </label>
          <Button
            onClick={handleClearFilters}
            variant="outline"
            size="sm"
            className="ml-auto"
          >
            Clear
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading businesses...</p>
        </div>
      ) : (
        <>
          {/* Featured businesses section */}
          {featuredBusinesses.length > 0 && (
            <div className="mb-12">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Featured Businesses
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {featuredBusinesses.map((business) => (
                  <BusinessCard key={business.id} business={business} />
                ))}
              </div>
            </div>
          )}

          {/* All businesses */}
          <div>
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              All Businesses ({businesses.length})
            </h2>
            
            {businesses.length === 0 ? (
              <div className="text-center py-12">
                <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No businesses found</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || locationFilter || typeFilter !== 'all' || verifiedOnly
                    ? 'Try adjusting your search filters.'
                    : 'Be the first to register your business!'}
                </p>
                <Button onClick={handleClearFilters} variant="outline" className="mr-2">
                  Clear Filters
                </Button>
                <Link href="/register?role=business">
                  <Button>Register Your Business</Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {businesses.map((business) => (
                  <BusinessCard key={business.id} business={business} />
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Registration CTA */}
      <div className="mt-12 p-6 bg-green-50 rounded-lg">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">
            Are you a halal business owner?
          </h3>
          <p className="text-gray-600 mb-4">
            Register your business on MosqueConnect to get visibility in the Muslim community
            and apply for halal certification.
          </p>
          <Link href="/register?role=business">
            <Button>Register Your Business</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

// Business card component
function BusinessCard({ business }) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="h-40 bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center relative">
        {business.images?.logo ? (
          <img 
            src={business.images.logo} 
            alt={business.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <Building2 className="h-12 w-12 text-gray-400" />
        )}
        {business.isFeatured && (
          <Badge className="absolute top-2 right-2 bg-yellow-500 text-white">
            <Star className="h-3 w-3 mr-1" />
            Featured
          </Badge>
        )}
      </div>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg line-clamp-1">{business.name}</h3>
          {business.isVerified && (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <Verified className="h-3 w-3 mr-1" />
              Verified
            </Badge>
          )}
        </div>
        
        <p className="text-gray-600 text-sm mb-2">
          {BUSINESS_TYPE_LABELS[business.category] || business.category} • {business.city}, {business.state}
        </p>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {business.description}
        </p>

        {/* Rating and contact info */}
        <div className="space-y-2 mb-4">
          {business.rating > 0 && (
            <div className="flex items-center gap-1 text-sm">
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
              <span>{business.rating.toFixed(1)}</span>
              <span className="text-gray-500">({business.reviewCount} reviews)</span>
            </div>
          )}
          
          {business.phone && (
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <Phone className="h-3 w-3" />
              <span className="truncate">{business.phone}</span>
            </div>
          )}
          
          {business.website && (
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <Globe className="h-3 w-3" />
              <span className="truncate">Website</span>
            </div>
          )}
        </div>

        <Link href={`/shop/${business.id}`}>
          <Button variant="outline" size="sm" className="w-full">
            View Store
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}