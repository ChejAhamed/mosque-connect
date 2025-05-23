"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import MosqueMap from "@/components/mosque/GoogleMap";
import { useSession } from "next-auth/react";
import { Badge } from "@/components/ui/badge";
import { MapPinIcon, PhoneIcon, MailIcon, Globe, Search } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Define mosque interface
interface Mosque {
  _id: string;
  name: string;
  description?: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  imageUrl?: string;
  facilityFeatures?: string[];
  status: 'pending' | 'approved' | 'rejected';
  verificationNotes?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  prayerTimes?: Record<string, string>;
  location?: {
    type: string;
    coordinates: [number, number];
  };
  phone?: string;
  email?: string;
  website?: string;
}

// Cities in UK for quick selection
const ukCities = [
  "London", "Manchester", "Birmingham", "Liverpool", "Leeds",
  "Glasgow", "Edinburgh", "Cardiff", "Belfast", "Bristol",
  "Newcastle", "Sheffield", "Leicester", "Southampton", "Bradford"
];

export default function MosquesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [featureFilter, setFeatureFilter] = useState("");
  const [mosques, setMosques] = useState<Mosque[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { toast } = useToast();
  const { data: session } = useSession();

  // Create sample mosques if none are found (for demo)
  const createSampleMosques = async () => {
    if (mosques.length === 0 && (session?.user?.role === 'admin' || session?.user?.role === 'imam')) {
      const sampleMosques = [
        {
          name: "East London Mosque",
          description: "One of the largest mosques in Europe serving the Muslim community in London.",
          address: "82-92 Whitechapel Rd",
          city: "London",
          state: "Greater London",
          zipCode: "E1 1JQ",
          phone: "020 7650 3000",
          email: "info@eastlondonmosque.org.uk",
          website: "https://www.eastlondonmosque.org.uk",
          facilityFeatures: ["prayer-hall", "womens-section", "parking", "wheelchair-access", "wudu-facilities", "quran-classes", "islamic-library", "funeral-services", "community-hall", "kitchen"],
          location: {
            type: "Point",
            coordinates: [-0.0649, 51.5187]
          }
        },
        {
          name: "Central Manchester Mosque",
          description: "A vibrant mosque serving the diverse Muslim community of Manchester.",
          address: "20 Upper Park Road",
          city: "Manchester",
          state: "Greater Manchester",
          zipCode: "M14 5RU",
          phone: "0161 225 1863",
          facilityFeatures: ["prayer-hall", "womens-section", "parking", "wudu-facilities", "quran-classes"],
          location: {
            type: "Point",
            coordinates: [-2.2309, 53.4498]
          }
        },
        {
          name: "Birmingham Central Mosque",
          description: "One of the oldest and most iconic mosques in Birmingham, serving the local community since 1975.",
          address: "180 Belgrave Middleway",
          city: "Birmingham",
          state: "West Midlands",
          zipCode: "B12 0XS",
          phone: "0121 440 5355",
          website: "https://www.centralmosque.org.uk",
          facilityFeatures: ["prayer-hall", "womens-section", "parking", "wheelchair-access", "wudu-facilities", "quran-classes", "islamic-library", "funeral-services"],
          location: {
            type: "Point",
            coordinates: [-1.8857, 52.4674]
          }
        }
      ];

      try {
        for (const mosque of sampleMosques) {
          await axios.post('/api/mosques', mosque);
        }
        toast({
          title: "Sample Data Created",
          description: "Sample mosque data has been created for demonstration.",
        });
        await fetchMosques();
      } catch (error) {
        console.error("Error creating sample mosques:", error);
      }
    }
  };

  // Filter the mosques based on search term and filters
  const filteredMosques = mosques.filter((mosque) => {
    const matchesSearch = searchTerm
      ? mosque.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (mosque.description && mosque.description.toLowerCase().includes(searchTerm.toLowerCase()))
      : true;

    const matchesLocation = locationFilter || selectedCity
      ? (mosque.city.toLowerCase().includes(locationFilter.toLowerCase()) ||
         mosque.state.toLowerCase().includes(locationFilter.toLowerCase()) ||
         mosque.zipCode.includes(locationFilter) ||
         (selectedCity && mosque.city.toLowerCase() === selectedCity.toLowerCase()))
      : true;

    const matchesFeature = featureFilter
      ? mosque.facilityFeatures
        ? mosque.facilityFeatures.some((feature) =>
            feature.toLowerCase().includes(featureFilter.toLowerCase())
          )
        : false
      : true;

    return matchesSearch && matchesLocation && matchesFeature;
  });

  // Fetch mosques from API
  const fetchMosques = async () => {
    try {
      setLoading(true);
      try {
        const response = await axios.get('/api/mosques');
        setMosques(response.data.mosques);
        setError("");

        // If no mosques are found and user is admin/imam, offer to create sample data
        if (response.data.mosques.length === 0 && (session?.user?.role === 'admin' || session?.user?.role === 'imam')) {
          toast({
            title: "No Mosques Found",
            description: "No mosques have been registered yet. Sample data will be created for demonstration.",
          });
          createSampleMosques();
        }
      } catch (error: any) {
        console.error('Failed to fetch mosque data:', error);
        setError("Failed to load mosques. Please try again later.");
        toast({
          title: "Error",
          description: error?.response?.data?.message || "Failed to load mosques. Please try again later.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMosques();
  }, [toast]);

  // Handle city selection
  const handleCitySelect = (city: string) => {
    setSelectedCity(city);
    setLocationFilter(city);
  };

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-4">Mosque Directory</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Find mosques near you, discover their needs, and connect with your local
          Muslim community.
        </p>
        <div className="mt-4">
          {session && (session.user.role === 'imam' || session.user.role === 'admin') && (
            <Link href="/mosques/register">
              <Button className="bg-green-600 hover:bg-green-700 mt-4">
                Register a New Mosque
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Search and filters */}
      <div className="mb-8 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-2 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search mosques..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <div className="relative">
            <MapPinIcon className="absolute left-2 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Filter by location..."
              value={locationFilter}
              onChange={(e) => {
                setLocationFilter(e.target.value);
                setSelectedCity("");
              }}
              className="pl-8"
            />
          </div>
          <div>
            <Input
              placeholder="Filter by features..."
              value={featureFilter}
              onChange={(e) => setFeatureFilter(e.target.value)}
            />
          </div>
          <div>
            <Button
              onClick={() => {
                setSearchTerm("");
                setLocationFilter("");
                setSelectedCity("");
                setFeatureFilter("");
              }}
              variant="outline"
              className="w-full"
            >
              Clear Filters
            </Button>
          </div>
        </div>

        {/* Quick city selection */}
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-gray-500 flex items-center">
            <MapPinIcon className="h-4 w-4 mr-1" /> Quick city select:
          </span>
          {ukCities.slice(0, 10).map((city) => (
            <Badge
              key={city}
              variant={selectedCity === city ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => handleCitySelect(city)}
            >
              {city}
            </Badge>
          ))}
          <Select onValueChange={handleCitySelect} value={selectedCity}>
            <SelectTrigger className="w-[130px] h-7 text-xs">
              <SelectValue placeholder="More cities..." />
            </SelectTrigger>
            <SelectContent>
              {ukCities.map((city) => (
                <SelectItem key={city} value={city}>{city}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Map - Using the dedicated MosqueMap component */}
      {!loading && !error && <MosqueMap mosques={filteredMosques} />}

      {/* Map placeholder when loading or error */}
      {(loading || error) && (
        <div className="w-full h-[400px] rounded-lg mb-8 bg-gray-100 flex items-center justify-center">
          {loading ? (
            <>
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-green-600 border-r-transparent"></div>
              <p className="ml-2 text-gray-600">Loading mosque data...</p>
            </>
          ) : (
            <p className="text-gray-500">
              Map could not be loaded. Please try again later.
            </p>
          )}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-green-600 border-r-transparent mb-4"></div>
          <p className="text-gray-600">Loading mosques...</p>
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="text-center py-12">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Try Again
          </Button>
        </div>
      )}

      {/* Mosques grid */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMosques.map((mosque) => (
            <Card key={mosque._id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className={`h-48 ${mosque.imageUrl ? '' : 'bg-gray-100'} flex items-center justify-center`}>
                {mosque.imageUrl ? (
                  <img
                    src={mosque.imageUrl}
                    alt={mosque.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-gray-400">No Image Available</div>
                )}
              </div>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-lg">{mosque.name}</h3>
                  {mosque.verified && (
                    <div className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
                      Verified
                    </div>
                  )}
                </div>

                <div className="flex items-start mb-3">
                  <MapPinIcon className="h-4 w-4 text-gray-400 mt-1 mr-2 flex-shrink-0" />
                  <p className="text-gray-600 text-sm">
                    {mosque.address}, {mosque.city}, {mosque.state} {mosque.zipCode}
                  </p>
                </div>

                {mosque.phone && (
                  <div className="flex items-center mb-1">
                    <PhoneIcon className="h-4 w-4 text-gray-400 mr-2" />
                    <p className="text-gray-600 text-sm">{mosque.phone}</p>
                  </div>
                )}

                {mosque.email && (
                  <div className="flex items-center mb-1">
                    <MailIcon className="h-4 w-4 text-gray-400 mr-2" />
                    <p className="text-gray-600 text-sm truncate">{mosque.email}</p>
                  </div>
                )}

                {mosque.website && (
                  <div className="flex items-center mb-3">
                    <Globe className="h-4 w-4 text-gray-400 mr-2" />
                    <a
                      href={mosque.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 text-sm hover:underline truncate"
                    >
                      {mosque.website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}

                {mosque.facilityFeatures && mosque.facilityFeatures.length > 0 && (
                  <div className="mb-4">
                    <div className="text-sm font-medium mb-1">Facilities:</div>
                    <div className="flex flex-wrap gap-1">
                      {mosque.facilityFeatures.slice(0, 3).map((feature) => (
                        <span
                          key={feature}
                          className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded"
                        >
                          {feature.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      ))}
                      {mosque.facilityFeatures.length > 3 && (
                        <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                          +{mosque.facilityFeatures.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex justify-end">
                  <Link href={`/mosques/${mosque._id}`}>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && !error && filteredMosques.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium mb-2">No mosques found</h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your search filters or register a mosque if you are an
            imam.
          </p>
          {session && (session.user.role === 'imam' || session.user.role === 'admin') && (
            <Link href="/mosques/register">
              <Button>Register a Mosque</Button>
            </Link>
          )}
          {!session && (
            <Link href="/login?callbackUrl=/mosques/register">
              <Button>Login to Register a Mosque</Button>
            </Link>
          )}
        </div>
      )}

      {/* Registration CTA */}
      <div className="mt-12 p-6 bg-green-50 rounded-lg">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">
            Are you an imam or mosque administrator?
          </h3>
          <p className="text-gray-600 mb-4">
            Register your mosque on MosqueConnect to find volunteers and increase
            visibility in the community.
          </p>
          {session && (session.user.role === 'imam' || session.user.role === 'admin') ? (
            <Link href="/mosques/register">
              <Button>Register Your Mosque</Button>
            </Link>
          ) : (
            <Link href="/login?callbackUrl=/mosques/register">
              <Button>Login to Register Your Mosque</Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
