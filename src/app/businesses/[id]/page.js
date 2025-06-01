'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  MapPin,
  Phone,
  Globe,
  Clock,
  Star,
  ArrowLeft,
  Mail,
  Verified
} from 'lucide-react';
import axios from 'axios';

function BusinessDetailsContent({ businessId }) {
  const router = useRouter();
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBusiness();
  }, [businessId]);

  const fetchBusiness = async () => {
    try {
      const response = await axios.get(`/api/businesses/${businessId}`);
      setBusiness(response.data.business);
    } catch (error) {
      console.error('Error fetching business:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="text-center">Loading business details...</div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Business Not Found</h1>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 pt-24">
      <Button 
        onClick={() => router.back()} 
        variant="outline" 
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Directory
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Info */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">{business.name}</CardTitle>
                  <CardDescription className="text-lg">{business.category}</CardDescription>
                </div>
                {business.isVerified && (
                  <Badge className="bg-green-100 text-green-800">
                    <Verified className="h-4 w-4 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-6">{business.description}</p>
              
              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {business.address && (
                  <div className="flex items-start gap-2">
                    <MapPin className="h-5 w-5 mt-0.5 text-gray-400" />
                    <div>
                      <p className="font-medium">Address</p>
                      <p className="text-sm text-gray-600">
                        {business.address}<br />
                        {business.city}, {business.state} {business.postalCode}
                      </p>
                    </div>
                  </div>
                )}
                
                {business.phone && (
                  <div className="flex items-start gap-2">
                    <Phone className="h-5 w-5 mt-0.5 text-gray-400" />
                    <div>
                      <p className="font-medium">Phone</p>
                      <p className="text-sm text-gray-600">{business.phone}</p>
                    </div>
                  </div>
                )}
                
                {business.email && (
                  <div className="flex items-start gap-2">
                    <Mail className="h-5 w-5 mt-0.5 text-gray-400" />
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-sm text-gray-600">{business.email}</p>
                    </div>
                  </div>
                )}
                
                {business.website && (
                  <div className="flex items-start gap-2">
                    <Globe className="h-5 w-5 mt-0.5 text-gray-400" />
                    <div>
                      <p className="font-medium">Website</p>
                      <a 
                        href={business.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Visit Website
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" asChild>
                <a href={`/shop/${business.id}`}>Visit Store</a>
              </Button>
              {business.phone && (
                <Button variant="outline" className="w-full" asChild>
                  <a href={`tel:${business.phone}`}>Call Now</a>
                </Button>
              )}
              {business.email && (
                <Button variant="outline" className="w-full" asChild>
                  <a href={`mailto:${business.email}`}>Send Email</a>
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Business Hours */}
          {business.hours && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Business Hours
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(business.hours).map(([day, hours]) => (
                    <div key={day} className="flex justify-between text-sm">
                      <span className="capitalize">{day}:</span>
                      <span>
                        {hours.closed ? 'Closed' : `${hours.open} - ${hours.close}`}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Rating */}
          {business.rating > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  Rating
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold">{business.rating.toFixed(1)}</div>
                  <div className="text-sm text-gray-600">
                    Based on {business.reviewCount} reviews
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default function BusinessDetailsPage({ params }) {
  const resolvedParams = use(params);
  return <BusinessDetailsContent businessId={resolvedParams.businessId} />;
}