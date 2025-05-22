"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import GoogleMap from "@/components/mosque/GoogleMap";

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
  verified: boolean;
  prayerTimes?: Record<string, string>;
  location?: {
    type: string;
    coordinates: [number, number];
  };
}

export default function MosquesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [featureFilter, setFeatureFilter] = useState("");
  const [mosques, setMosques] = useState<Mosque[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { toast } = useToast();

  // Filter the mosques based on search term and filters
  const filteredMosques = mosques.filter((mosque) => {
    const matchesSearch = searchTerm
      ? mosque.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (mosque.description && mosque.description.toLowerCase().includes(searchTerm.toLowerCase()))
      : true;

    const matchesLocation = locationFilter
      ? mosque.city.toLowerCase().includes(locationFilter.toLowerCase()) ||
        mosque.state.toLowerCase().includes(locationFilter.toLowerCase()) ||
        mosque.zipCode.includes(locationFilter)
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
  useEffect(() => {
    async function fetchMosques() {
      try {
        setLoading(true);
        try {
          const response = await axios.get('/api/mosques');
          setMosques(response.data.mosques);
          setError("");
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
    }

    fetchMosques();
  }, [toast]);

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-4">Mosque Directory</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Find mosques near you, discover their needs, and connect with your local
          Muslim community.
        </p>
      </div>

      {/* Search and filters */}
      <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <Input
            placeholder="Search mosques..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div>
          <Input
            placeholder="Filter by location..."
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
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
              setFeatureFilter("");
            }}
            variant="outline"
            className="w-full"
          >
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Map - Using the dedicated GoogleMap component */}
      {!loading && !error && <GoogleMap mosques={filteredMosques} />}

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
            <Card key={mosque._id} className="overflow-hidden">
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

                <p className="text-gray-600 text-sm mb-4">
                  {mosque.address}, {mosque.city}, {mosque.state} {mosque.zipCode}
                </p>

                {mosque.facilityFeatures && mosque.facilityFeatures.length > 0 && (
                  <div className="mb-4">
                    <div className="text-sm font-medium mb-1">Facilities:</div>
                    <div className="flex flex-wrap gap-1">
                      {mosque.facilityFeatures.slice(0, 3).map((feature) => (
                        <span
                          key={feature}
                          className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded"
                        >
                          {feature}
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
          <p className="text-gray-600">
            Try adjusting your search filters or register a mosque if you are an
            imam.
          </p>
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
          <Link href="/register?role=imam">
            <Button>Register Your Mosque</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
