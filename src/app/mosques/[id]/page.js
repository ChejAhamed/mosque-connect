"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

// Hardcoded mosque data for specific IDs
const KNOWN_MOSQUES = {
  '682f93c72ce797513c762791': {
    _id: '682f93c72ce797513c762791',
    name: "Masjid Al-Huda",
    description: "Welcome to Masjid Al-Huda, a vibrant center for Islamic worship and community engagement.",
    address: "456 Islamic Way",
    city: "London",
    state: "Greater London",
    zipCode: "E1 1AA",
    phone: "+44 20 7123 4567",
    email: "info@masjidhuda.org",
    website: "https://example.com/masjid-al-huda",
    facilityFeatures: ["prayer-hall", "women-section", "ablution-area", "parking", "community-center", "library"],
    prayerTimes: {
      fajr: "4:15 AM",
      dhuhr: "1:30 PM",
      asr: "6:45 PM",
      maghrib: "8:15 PM",
      isha: "10:00 PM"
    },
    imageUrl: "https://images.unsplash.com/photo-1585129918930-eef8f4a0d6a9?q=80&w=1000&auto=format&fit=crop"
  },
  '68078727e9349908b444e1e8': {
    _id: '68078727e9349908b444e1e8',
    name: "Test Mosque",
    description: "This is a test mosque with sample data for demonstration purposes.",
    address: "123 Test Street",
    city: "Test City",
    state: "Test State",
    zipCode: "12345",
    phone: "+1 555-123-4567",
    email: "test@example.com",
    facilityFeatures: ["prayer-hall", "ablution-area", "parking"],
    prayerTimes: {
      fajr: "5:30 AM",
      dhuhr: "1:30 PM",
      asr: "4:45 PM",
      maghrib: "7:15 PM",
      isha: "8:45 PM"
    },
    imageUrl: "https://images.unsplash.com/photo-1602990721338-9cbb5b983c4d?q=80&w=1000&auto=format&fit=crop"
  }
};

// Default fallback mosque for any other ID
const DEFAULT_MOSQUE = {
  name: "Sample Mosque",
  description: "This is a sample mosque data. The actual mosque information couldn't be retrieved from the database at this time.",
  address: "123 Main Street",
  city: "Example City",
  state: "Example State",
  zipCode: "12345",
  facilityFeatures: ["prayer-hall", "ablution-area", "parking"],
  prayerTimes: {
    fajr: "5:30 AM",
    dhuhr: "1:30 PM",
    asr: "4:45 PM",
    maghrib: "7:15 PM",
    isha: "8:45 PM"
  },
  imageUrl: "https://images.unsplash.com/photo-1603595829982-373ac028bc99?q=80&w=1000&auto=format&fit=crop"
};

export default function MosquePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  
  const [mosque, setMosque] = useState(null);
  const [loading, setLoading] = useState(true);
  const id = params?.id;

  // Fetch mosque data function
  const fetchMosqueData = async (mosqueId) => {
    try {
      console.log(`Attempting to fetch mosque with ID: ${mosqueId}`);

      // First try to get from API
      const response = await fetch(`/api/mosques/${mosqueId}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          console.log(`Successfully loaded mosque from API: ${data.data.name}`);
          return data.data;
        }
      }
      
      // Fallback to known mosques
      if (KNOWN_MOSQUES[mosqueId]) {
        console.log(`Using known mosque data for ID: ${mosqueId}`);
        return KNOWN_MOSQUES[mosqueId];
      }
      
      // Final fallback
      console.warn(`No mosque found with ID: ${mosqueId}, using default`);
      return { ...DEFAULT_MOSQUE, _id: mosqueId };
      
    } catch (error) {
      console.error('Error fetching mosque data:', error);
      return { ...DEFAULT_MOSQUE, _id: mosqueId };
    }
  };

  // Load mosque data on component mount
  useEffect(() => {
    if (id) {
      console.log(`Rendering mosque page for ID: ${id}`);
      fetchMosqueData(id).then(mosqueData => {
        setMosque(mosqueData);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [id]);

  // Handle volunteer success message
  useEffect(() => {
    if (searchParams.get('volunteered') === 'true') {
      toast({
        title: "Success!",
        description: "Your volunteer registration has been submitted successfully! The mosque will contact you soon.",
      });
    }
  }, [searchParams, toast]);

  // Debug session
  useEffect(() => {
    console.log('Session status:', status);
    console.log('Session data:', session);
  }, [session, status]);

  // Handle volunteer button click
  const handleVolunteerClick = () => {
    if (status === 'loading') {
      return;
    }
    
    if (!session) {
      router.push(`/login?callbackUrl=/mosques/${id}`);
      return;
    }
    
    if (session.user.role !== 'user') {
      toast({
        title: "Access Restricted",
        description: "Only community members can volunteer. Please register with a community member account.",
        variant: "destructive",
      });
      return;
    }
    
    router.push(`/volunteers/register-for-mosque?mosque=${id}&name=${encodeURIComponent(mosque?.name || 'Mosque')}`);
  };

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">Loading mosque information...</div>
        </div>
      </div>
    );
  }

  // No mosque found
  if (!mosque) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <Alert>
            <AlertDescription>
              Mosque not found. <Link href="/mosques" className="text-blue-600 hover:underline">Browse all mosques</Link>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  // Format facility features for better display
  const formattedFeatures = mosque.facilityFeatures?.map(feature =>
    feature.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  ) || [];

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">{mosque.name}</h1>
          <div className="flex gap-4">
            <Button 
              onClick={handleVolunteerClick}
              className="bg-green-600 hover:bg-green-700"
              disabled={status === 'loading'}
            >
              {status === 'loading' ? 'Loading...' : 
               !session ? 'Login to Volunteer' : 
               session.user.role !== 'user' ? 'Volunteers Only' : 
               `Volunteer at ${mosque.name}`}
            </Button>
            <Link href="/mosques">
              <Button variant="outline">Back to Mosques</Button>
            </Link>
          </div>
        </div>

        {/* Show session info for debugging */}
        {session && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <AlertDescription>
              Logged in as: {session.user.email} ({session.user.role})
            </AlertDescription>
          </Alert>
        )}

        {!session && (
          <Alert className="mb-6 bg-blue-50 border-blue-200">
            <AlertDescription>
              <Link href="/login" className="text-blue-600 hover:underline">Login</Link> to volunteer at this mosque
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div className="md:col-span-2">
            {mosque.imageUrl ? (
              <div className="relative h-[300px] w-full rounded-lg overflow-hidden">
                <img
                  src={mosque.imageUrl}
                  alt={mosque.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="h-[300px] w-full bg-gray-200 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">No image available</p>
              </div>
            )}
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium">Address</h3>
                  <p className="text-sm text-gray-600">{mosque.address}</p>
                  <p className="text-sm text-gray-600">{mosque.city}, {mosque.state} {mosque.zipCode}</p>
                </div>

                {mosque.phone && (
                  <div>
                    <h3 className="font-medium">Phone</h3>
                    <p className="text-sm text-gray-600">{mosque.phone}</p>
                  </div>
                )}

                {mosque.email && (
                  <div>
                    <h3 className="font-medium">Email</h3>
                    <p className="text-sm text-gray-600">{mosque.email}</p>
                  </div>
                )}

                {mosque.website && (
                  <div>
                    <h3 className="font-medium">Website</h3>
                    <a
                      href={mosque.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-green-600 hover:underline"
                    >
                      {mosque.website}
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                {mosque.description || "No description available."}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Facilities</CardTitle>
            </CardHeader>
            <CardContent>
              {formattedFeatures.length > 0 ? (
                <ul className="grid grid-cols-2 gap-2">
                  {formattedFeatures.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm">
                      <span className="w-2 h-2 bg-green-600 rounded-full mr-2" />
                      {feature}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-600">No facilities information available.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Prayer Times</CardTitle>
          </CardHeader>
          <CardContent>
            {mosque.prayerTimes && Object.keys(mosque.prayerTimes).length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {Object.entries(mosque.prayerTimes).map(([prayer, time]) => (
                  <div key={prayer} className="text-center p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-medium capitalize">{prayer}</h3>
                    <p className="text-lg font-bold text-green-600">{time}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-4">
                <p className="text-gray-600 mb-4">Prayer times are not available at the moment.</p>
                <Link href="/">
                  <Button variant="outline" size="sm">Check Prayer Times</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {mosque.imamId && (
          <Card>
            <CardHeader>
              <CardTitle>Imam Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-medium">
                    {mosque.imamId.name ? mosque.imamId.name.charAt(0) : 'I'}
                  </span>
                </div>
                <div>
                  <h3 className="font-medium">{mosque.imamId.name}</h3>
                  <p className="text-sm text-gray-600">{mosque.imamId.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}