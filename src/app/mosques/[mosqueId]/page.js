'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  Clock,
  Users,
  Calendar,
  ArrowLeft,
  UserPlus,
  Building
} from 'lucide-react';
import axios from 'axios';
import { useSession } from 'next-auth/react';

function MosqueDetailsContent({ mosqueId }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [mosque, setMosque] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMosque();
  }, [mosqueId]);

  const fetchMosque = async () => {
    try {
      const response = await axios.get(`/api/mosques/${mosqueId}`);
      if (response.data.success) {
        setMosque(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching mosque:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVolunteerApplication = () => {
    if (!session) {
      router.push(`/login?callbackUrl=/mosques/${mosqueId}`);
      return;
    }
    
    if (session.user.role !== 'user') {
      alert('Only community members can volunteer.');
      return;
    }
    
    router.push(`/volunteers/register-for-mosque?mosque=${mosqueId}&name=${encodeURIComponent(mosque.name)}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="text-center">Loading mosque details...</div>
      </div>
    );
  }

  if (!mosque) {
    return (
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Mosque Not Found</h1>
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
                  <CardTitle className="text-2xl">{mosque.name}</CardTitle>
                  <CardDescription className="text-lg">
                    {mosque.city}, {mosque.state}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  {mosque.verified && (
                    <Badge className="bg-green-100 text-green-800">
                      Verified
                    </Badge>
                  )}
                  <Badge variant="outline">
                    {mosque.status}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {mosque.description && (
                <p className="text-gray-700 mb-6">{mosque.description}</p>
              )}
              
              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-start gap-2">
                  <MapPin className="h-5 w-5 mt-0.5 text-gray-400" />
                  <div>
                    <p className="font-medium">Address</p>
                    <p className="text-sm text-gray-600">
                      {mosque.address}<br />
                      {mosque.city}, {mosque.state} {mosque.zipCode}
                    </p>
                  </div>
                </div>
                
                {mosque.phone && (
                  <div className="flex items-start gap-2">
                    <Phone className="h-5 w-5 mt-0.5 text-gray-400" />
                    <div>
                      <p className="font-medium">Phone</p>
                      <p className="text-sm text-gray-600">{mosque.phone}</p>
                    </div>
                  </div>
                )}
                
                {mosque.email && (
                  <div className="flex items-start gap-2">
                    <Mail className="h-5 w-5 mt-0.5 text-gray-400" />
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-sm text-gray-600">{mosque.email}</p>
                    </div>
                  </div>
                )}
                
                {mosque.website && (
                  <div className="flex items-start gap-2">
                    <Globe className="h-5 w-5 mt-0.5 text-gray-400" />
                    <div>
                      <p className="font-medium">Website</p>
                      <a 
                        href={mosque.website} 
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

              {/* Facilities */}
              {mosque.facilityFeatures && mosque.facilityFeatures.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-3">Facilities</h3>
                  <div className="flex flex-wrap gap-2">
                    {mosque.facilityFeatures.map((feature, index) => (
                      <Badge key={index} variant="outline">
                        {feature.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Services */}
              {mosque.services && mosque.services.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-3">Services</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {mosque.services.map((service, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{service}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
              <Button 
                className="w-full"
                onClick={handleVolunteerApplication}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Volunteer Here
              </Button>
              {mosque.phone && (
                <Button variant="outline" className="w-full" asChild>
                  <a href={`tel:${mosque.phone}`}>Call Mosque</a>
                </Button>
              )}
              {mosque.email && (
                <Button variant="outline" className="w-full" asChild>
                  <a href={`mailto:${mosque.email}`}>Send Email</a>
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Prayer Times */}
          {mosque.prayerTimes && Object.keys(mosque.prayerTimes).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Prayer Times
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(mosque.prayerTimes).map(([prayer, time]) => (
                    <div key={prayer} className="flex justify-between text-sm">
                      <span className="capitalize">{prayer}:</span>
                      <span>{time}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Stats */}
          {mosque.stats && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Community Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Members:</span>
                    <span>{mosque.stats.totalMembers || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Events:</span>
                    <span>{mosque.stats.totalEvents || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Volunteers:</span>
                    <span>{mosque.stats.totalVolunteers || 0}</span>
                  </div>
                  {mosque.capacity && (
                    <div className="flex justify-between">
                      <span>Capacity:</span>
                      <span>{mosque.capacity}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Imam Info */}
          {mosque.imam && (
            <Card>
              <CardHeader>
                <CardTitle>Imam Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm">
                  <p className="font-medium">{mosque.imam.name}</p>
                  <p className="text-gray-600">{mosque.imam.email}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MosqueDetailsPage({ params }) {
  const resolvedParams = use(params);
  return <MosqueDetailsContent mosqueId={resolvedParams.mosqueId} />;
}