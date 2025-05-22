'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  Clock,
  Store,
  ChevronLeft,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner, ErrorState } from '@/components/ui/loading-states';
import { BusinessAnnouncements } from '@/components/business/BusinessAnnouncements';

export default function BusinessPage({ params }) {
  const router = useRouter();
  const [business, setBusiness] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        // This would be a real API call in a production app
        // For now, we'll simulate fetching the business
        setIsLoading(true);

        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Mock business data
        const mockBusiness = {
          _id: params.id,
          name: 'Halal Groceries & Butcher',
          description: 'Your local halal grocery store offering fresh meat, vegetables, and imported goods.',
          type: 'Grocery Store',
          address: '123 Main Street',
          city: 'Birmingham',
          postalCode: 'B1 1AA',
          country: 'United Kingdom',
          phone: '0121 123 4567',
          email: 'info@halalgroceries.example.com',
          website: 'https://www.halalgroceries.example.com',
          isVerified: true,
          images: [
            'https://images.unsplash.com/photo-1604719312566-8912e9c8a213?ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8Z3JvY2VyeSUyMHN0b3JlfGVufDB8fDB8fA%3D%3D&ixlib=rb-1.2.1&w=1000&q=80',
          ],
          // Mock announcements data
          announcements: [
            {
              _id: '1',
              title: 'Eid Special Discount',
              content: 'Get 20% off on all meat products for Eid-ul-Adha. Valid from July 15 to July 20. Come early for the best selection!',
              type: 'offer',
              startDate: '2023-07-15T00:00:00Z',
              endDate: '2023-07-20T23:59:59Z',
              isActive: true,
              imageUrl: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
            },
            {
              _id: '2',
              title: 'New Halal Products Arrived',
              content: 'We have just received a new shipment of imported halal products from Turkey and Malaysia. Fresh spices, sweets, and snacks now available in-store!',
              type: 'news',
              startDate: '2023-06-01T00:00:00Z',
              isActive: true
            },
            {
              _id: '3',
              title: 'Ramadan Opening Hours',
              content: 'During the holy month of Ramadan, our store will be open from 10AM to 12AM daily to accommodate your needs for iftar and suhoor preparations.',
              type: 'announcement',
              startDate: '2023-03-22T00:00:00Z',
              endDate: '2023-04-20T23:59:59Z',
              isActive: true
            }
          ]
        };

        setBusiness(mockBusiness);
      } catch (err) {
        console.error('Error fetching business:', err);
        setError('Failed to load business details. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchBusiness();
    }
  }, [params.id]);

  if (isLoading) {
    return <LoadingSpinner message="Loading business details..." />;
  }

  if (error) {
    return (
      <div className="container mx-auto py-12 px-4">
        <ErrorState
          message={error}
          actionButton={
            <Button onClick={() => router.push('/businesses')}>
              Return to Business Directory
            </Button>
          }
        />
      </div>
    );
  }

  if (!business) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Business Not Found</h1>
        <p className="text-gray-600 mb-6">
          The business you are looking for doesn't exist or has been removed.
        </p>
        <Link href="/businesses">
          <Button>Return to Business Directory</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Button variant="outline" size="sm" onClick={() => router.push('/businesses')}>
          <ChevronLeft className="h-4 w-4 mr-1" /> Back to Businesses
        </Button>
      </div>

      {/* Business Header */}
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        {/* Business Image */}
        <div className="md:w-1/3">
          {business.images && business.images.length > 0 ? (
            <div className="rounded-lg overflow-hidden h-64 bg-gray-200">
              <img
                src={business.images[0]}
                alt={business.name}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="rounded-lg overflow-hidden h-64 bg-gray-200 flex items-center justify-center">
              <Store className="h-16 w-16 text-gray-400" />
            </div>
          )}
        </div>

        {/* Business Details */}
        <div className="md:w-2/3">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">{business.name}</h1>
              <div className="flex items-center mb-2">
                <Badge className="mr-2 bg-green-100 text-green-800 hover:bg-green-200">
                  {business.type}
                </Badge>
                {business.isVerified && (
                  <Badge variant="outline" className="border-blue-500 text-blue-600">
                    Verified
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <p className="text-gray-700 mb-6">{business.description}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start">
              <MapPin className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
              <div>
                <p className="font-medium">Address</p>
                <p className="text-gray-600">{business.address}</p>
                <p className="text-gray-600">{business.city}, {business.postalCode}</p>
                <p className="text-gray-600">{business.country}</p>
              </div>
            </div>

            {business.phone && (
              <div className="flex items-start">
                <Phone className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                <div>
                  <p className="font-medium">Phone</p>
                  <p className="text-gray-600">{business.phone}</p>
                </div>
              </div>
            )}

            {business.email && (
              <div className="flex items-start">
                <Mail className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-gray-600">{business.email}</p>
                </div>
              </div>
            )}

            {business.website && (
              <div className="flex items-start">
                <Globe className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                <div>
                  <p className="font-medium">Website</p>
                  <a href={business.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {business.website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Announcements & Offers Section */}
      <BusinessAnnouncements announcements={business.announcements} />

      {/* This would be expanded with products, reviews, etc. */}
      <div className="mt-8 border-t pt-8">
        <h2 className="text-2xl font-bold mb-4">Products</h2>
        <p className="text-gray-600">
          Product listings coming soon.
        </p>
      </div>
    </div>
  );
}
