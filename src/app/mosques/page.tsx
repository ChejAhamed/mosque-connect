"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import Script from "next/script";

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

// Define google maps window interface
declare global {
  interface Window {
    initMap: () => void;
    google: any;
  }
}

export default function MosquesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [featureFilter, setFeatureFilter] = useState("");
  const [mosques, setMosques] = useState<Mosque[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { toast } = useToast();

  // Add refs for map and markers
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

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

  // Initialize map
  const initMap = () => {
    if (!window.google || !mapContainerRef.current) return;

    // Default center (can be anywhere in the UK)
    const defaultCenter = { lat: 51.5074, lng: -0.1278 }; // London

    // Create map
    mapRef.current = new window.google.maps.Map(mapContainerRef.current, {
      zoom: 10,
      center: defaultCenter,
      mapTypeControl: true,
      streetViewControl: false,
      fullscreenControl: true,
    });

    setMapLoaded(true);
  };

  // Update map markers when mosques change
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || !window.google) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Create new markers for filtered mosques
    const bounds = new window.google.maps.LatLngBounds();
    let markersAdded = 0;

    filteredMosques.forEach(mosque => {
      // Check if mosque has location data
      if (mosque.location?.coordinates &&
          mosque.location.coordinates[0] !== 0 &&
          mosque.location.coordinates[1] !== 0) {

        const position = {
          lat: mosque.location.coordinates[1], // Latitude is second in GeoJSON
          lng: mosque.location.coordinates[0]  // Longitude is first in GeoJSON
        };

        // Create marker
        const marker = new window.google.maps.Marker({
          position,
          map: mapRef.current,
          title: mosque.name,
          animation: window.google.maps.Animation.DROP
        });

        // Create info window
        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="max-width: 200px;">
              <h3 style="margin: 0 0 5px; font-size: 16px;">${mosque.name}</h3>
              <p style="margin: 0 0 5px; font-size: 12px;">${mosque.address}, ${mosque.city}</p>
              <a href="/mosques/${mosque._id}" style="font-size: 12px; color: #1d4ed8;">View Details</a>
            </div>
          `
        });

        // Add click listener for info window
        marker.addListener('click', () => {
          infoWindow.open(mapRef.current, marker);
        });

        // Store marker for later cleanup
        markersRef.current.push(marker);

        // Extend bounds to include this marker
        bounds.extend(position);
        markersAdded++;
      }
    });

    // Adjust map view to fit all markers if we have any
    if (markersAdded > 0) {
      mapRef.current.fitBounds(bounds);

      // If only one marker, zoom out a bit
      if (markersAdded === 1) {
        window.google.maps.event.addListenerOnce(mapRef.current, 'bounds_changed', () => {
          mapRef.current.setZoom(Math.min(14, mapRef.current.getZoom()));
        });
      }
    }
  }, [filteredMosques, mapLoaded]);

  // Setup Google Maps when component mounts
  useEffect(() => {
    // Define the initialization function for Google Maps
    window.initMap = () => {
      initMap();
    };

    // If Google Maps already loaded, initialize map directly
    if (window.google && window.google.maps) {
      initMap();
    }
  }, []);

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
      {/* Google Maps API Script */}
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=AIzaSyBNLrJhOMz6idD05pzfn5lhA-TAw-mAZCU&callback=initMap&libraries=places`}
        async
        defer
      />

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

      {/* Map */}
      <div
        ref={mapContainerRef}
        className="w-full h-[400px] rounded-lg mb-8 bg-gray-100 overflow-hidden"
      >
        {!mapLoaded && (
          <div className="w-full h-full flex items-center justify-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-green-600 border-r-transparent"></div>
            <p className="ml-2 text-gray-600">Loading map...</p>
          </div>
        )}
      </div>

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


];
