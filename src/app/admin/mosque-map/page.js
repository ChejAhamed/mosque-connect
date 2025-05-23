'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-states';
import {
  MapPin,
  Search,
  Settings,
  Phone,
  Mail,
  Globe,
  Info,
  Layers,
  X,
  Check,
  ArrowLeft
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Define the component for the Mosque Map
export default function MosqueMapPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [mosques, setMosques] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMosque, setSelectedMosque] = useState(null);
  const [mapInitialized, setMapInitialized] = useState(false);
  const [mapView, setMapView] = useState('all'); // 'all', 'city', 'nearby'
  const [cityFilter, setCityFilter] = useState('');
  const [showFeatures, setShowFeatures] = useState(true);
  const [radiusKm, setRadiusKm] = useState(5);

  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const googleMapRef = useRef(null);
  const infoWindowRef = useRef(null);

  // Check authentication and authorization
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/admin/mosque-map');
      return;
    }

    if (status === 'authenticated' && session.user.role !== 'admin') {
      router.push('/unauthorized');
      return;
    }
  }, [status, session, router]);

  // Initialize Google Maps
  useEffect(() => {
    if (status === 'authenticated' && !mapInitialized) {
      const loadGoogleMapsScript = () => {
        if (window.google && window.google.maps) {
          initializeMap();
          return;
        }

        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = initializeMap;
        script.onerror = () => {
          toast({
            title: 'Google Maps Error',
            description: 'Failed to load Google Maps. Please try again later.',
            variant: 'destructive',
          });
          setLoading(false);
        };
        document.head.appendChild(script);
      };

      loadGoogleMapsScript();
    }
  }, [status, toast, mapInitialized]);

  // Initialize the map
  const initializeMap = useCallback(() => {
    try {
      // Create map centered on London (default)
      const mapOptions = {
        center: { lat: 51.5074, lng: -0.1278 }, // London
        zoom: 10,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
        mapTypeId: 'roadmap'
      };

      // Create the map
      const map = new window.google.maps.Map(mapRef.current, mapOptions);
      googleMapRef.current = map;

      // Create info window for markers
      infoWindowRef.current = new window.google.maps.InfoWindow();

      // Fetch mosques data
      fetchMosques();

      setMapInitialized(true);
    } catch (error) {
      console.error('Error initializing map:', error);
      toast({
        title: 'Map Error',
        description: 'Failed to initialize the map. Please reload the page.',
        variant: 'destructive',
      });
      setLoading(false);
    }
  }, [toast]);

  // Fetch mosque data from API
  const fetchMosques = async () => {
    try {
      setLoading(true);
      // Only fetch approved mosques
      const response = await axios.get('/api/mosques?status=approved');

      if (response.data && response.data.mosques) {
        const mosqueData = response.data.mosques.filter(
          mosque => mosque.location && mosque.location.coordinates &&
          mosque.location.coordinates.length === 2
        );

        setMosques(mosqueData);

        // Add markers to the map
        if (googleMapRef.current) {
          addMarkersToMap(mosqueData);
        }
      }
    } catch (error) {
      console.error('Error fetching mosques:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch mosque data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Add markers to the map
  const addMarkersToMap = useCallback((mosqueData) => {
    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Define bounds to fit all markers
    const bounds = new window.google.maps.LatLngBounds();

    // Add new markers
    mosqueData.forEach((mosque) => {
      if (mosque.location && mosque.location.coordinates && mosque.location.coordinates.length === 2) {
        // Coordinates are stored as [longitude, latitude] in GeoJSON
        const position = {
          lat: mosque.location.coordinates[1],
          lng: mosque.location.coordinates[0]
        };

        const marker = new window.google.maps.Marker({
          position,
          map: googleMapRef.current,
          title: mosque.name,
          animation: window.google.maps.Animation.DROP,
          icon: {
            url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
            scaledSize: new window.google.maps.Size(40, 40)
          }
        });

        // Add click event listener to marker
        marker.addListener('click', () => {
          setSelectedMosque(mosque);
          infoWindowRef.current.setContent(
            `<div style="font-weight:bold;">${mosque.name}</div>
             <div>${mosque.address}, ${mosque.city}</div>`
          );
          infoWindowRef.current.open(googleMapRef.current, marker);
        });

        markersRef.current.push(marker);
        bounds.extend(position);
      }
    });

    // Adjust map bounds to fit all markers if there are markers
    if (markersRef.current.length > 0) {
      googleMapRef.current.fitBounds(bounds);

      // Don't zoom in too far
      const listener = googleMapRef.current.addListener('idle', () => {
        if (googleMapRef.current.getZoom() > 15) {
          googleMapRef.current.setZoom(15);
        }
        window.google.maps.event.removeListener(listener);
      });
    }
  }, []);

  // Filter mosques based on search term and other filters
  const filteredMosques = mosques.filter(mosque => {
    const matchesSearch = !searchTerm ||
      mosque.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mosque.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mosque.city.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCity = !cityFilter ||
      mosque.city.toLowerCase() === cityFilter.toLowerCase();

    // Only apply city filter if mapView is 'city'
    return matchesSearch && (mapView !== 'city' || matchesCity);
  });

  // Update markers when filters change
  useEffect(() => {
    if (mapInitialized && googleMapRef.current) {
      addMarkersToMap(filteredMosques);
    }
  }, [filteredMosques, mapInitialized, addMarkersToMap]);

  // Find user's location and show nearby mosques
  const showNearbyMosques = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };

          // Center map on user location
          googleMapRef.current.setCenter(userLocation);
          googleMapRef.current.setZoom(12);

          // Add user marker
          const userMarker = new window.google.maps.Marker({
            position: userLocation,
            map: googleMapRef.current,
            title: 'Your Location',
            icon: {
              url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
              scaledSize: new window.google.maps.Size(40, 40)
            }
          });

          // Add circle to represent search radius
          const circle = new window.google.maps.Circle({
            map: googleMapRef.current,
            radius: radiusKm * 1000, // Convert km to meters
            fillColor: '#007bff',
            fillOpacity: 0.1,
            strokeColor: '#007bff',
            strokeOpacity: 0.5,
            strokeWeight: 1,
            center: userLocation
          });

          // Filter mosques within the radius
          const nearbyMosques = mosques.filter(mosque => {
            if (mosque.location && mosque.location.coordinates) {
              const mosqueLatLng = new window.google.maps.LatLng(
                mosque.location.coordinates[1],
                mosque.location.coordinates[0]
              );

              const distance = window.google.maps.geometry.spherical.computeDistanceBetween(
                new window.google.maps.LatLng(userLocation.lat, userLocation.lng),
                mosqueLatLng
              );

              return distance <= radiusKm * 1000; // Convert km to meters
            }
            return false;
          });

          // Update markers
          addMarkersToMap(nearbyMosques);

          setMapView('nearby');
          setLoading(false);

          toast({
            title: 'Nearby Mosques',
            description: `Found ${nearbyMosques.length} mosques within ${radiusKm}km of your location.`,
          });
        },
        (error) => {
          console.error('Geolocation error:', error);
          toast({
            title: 'Location Error',
            description: 'Failed to get your location. Please allow location access and try again.',
            variant: 'destructive',
          });
          setLoading(false);
        },
        { enableHighAccuracy: true }
      );
    } else {
      toast({
        title: 'Geolocation Not Supported',
        description: 'Your browser does not support geolocation.',
        variant: 'destructive',
      });
    }
  };

  // Filter mosques by city
  const filterByCity = (city) => {
    setCityFilter(city);
    setMapView('city');

    const cityMosques = mosques.filter(mosque =>
      mosque.city.toLowerCase() === city.toLowerCase()
    );

    if (cityMosques.length > 0) {
      addMarkersToMap(cityMosques);

      toast({
        title: 'City Filter Applied',
        description: `Showing ${cityMosques.length} mosques in ${city}.`,
      });
    } else {
      toast({
        title: 'No Mosques Found',
        description: `No mosques found in ${city}.`,
        variant: 'destructive',
      });
    }
  };

  // Reset filters and show all mosques
  const showAllMosques = () => {
    setSearchTerm('');
    setCityFilter('');
    setMapView('all');
    addMarkersToMap(mosques);

    // Reset map view to fit all markers
    if (mosques.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      markersRef.current.forEach(marker => {
        bounds.extend(marker.getPosition());
      });
      googleMapRef.current.fitBounds(bounds);
    }
  };

  // Get unique cities from mosques
  const uniqueCities = [...new Set(mosques.map(mosque => mosque.city))].sort();

  // Handle the case when loading or no mosques
  if (status === 'loading' || loading) {
    return <LoadingSpinner message="Loading mosque map..." />;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Mosque Map</h1>
        <div className="flex space-x-2">
          <Link href="/admin/mosque-statistics">
            <Button variant="outline" className="flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Statistics
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {/* Controls and Filters */}
        <div className="md:col-span-1 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Search & Filters</CardTitle>
              <CardDescription>Find mosques on the map</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-2 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name, address..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium">View Mode</div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={mapView === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={showAllMosques}
                  >
                    All Mosques
                  </Button>
                  <Button
                    variant={mapView === 'nearby' ? 'default' : 'outline'}
                    size="sm"
                    onClick={showNearbyMosques}
                  >
                    Nearby
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant={mapView === 'city' ? 'default' : 'outline'}
                        size="sm"
                      >
                        By City
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 max-h-80 overflow-y-auto">
                      <DropdownMenuLabel>Select City</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuGroup>
                        {uniqueCities.map((city) => (
                          <DropdownMenuItem
                            key={city}
                            onClick={() => filterByCity(city)}
                          >
                            {cityFilter === city && <Check className="mr-2 h-4 w-4" />}
                            {city}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium">Display Options</div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={showFeatures ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setShowFeatures(!showFeatures)}
                    className="flex items-center"
                  >
                    {showFeatures ? (
                      <>
                        <Check className="mr-1 h-4 w-4" />
                        Features
                      </>
                    ) : (
                      <>
                        <X className="mr-1 h-4 w-4" />
                        Features
                      </>
                    )}
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="flex items-center">
                        <Layers className="mr-1 h-4 w-4" />
                        Map Type
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => googleMapRef.current.setMapTypeId('roadmap')}>
                        Roadmap
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => googleMapRef.current.setMapTypeId('satellite')}>
                        Satellite
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => googleMapRef.current.setMapTypeId('hybrid')}>
                        Hybrid
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => googleMapRef.current.setMapTypeId('terrain')}>
                        Terrain
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {mapView === 'nearby' && (
                <div className="space-y-2">
                  <div className="text-sm font-medium">Search Radius: {radiusKm} km</div>
                  <Input
                    type="range"
                    min="1"
                    max="20"
                    value={radiusKm}
                    onChange={(e) => setRadiusKm(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Mosque List</CardTitle>
              <CardDescription>
                {filteredMosques.length} mosques found
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                {filteredMosques.length > 0 ? (
                  filteredMosques.map((mosque) => (
                    <div
                      key={mosque._id}
                      className={`p-2 border rounded-md cursor-pointer transition-colors ${
                        selectedMosque && selectedMosque._id === mosque._id
                          ? 'bg-green-50 border-green-200'
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => {
                        setSelectedMosque(mosque);

                        // Center map on mosque
                        if (googleMapRef.current && mosque.location?.coordinates) {
                          googleMapRef.current.setCenter({
                            lat: mosque.location.coordinates[1],
                            lng: mosque.location.coordinates[0]
                          });
                          googleMapRef.current.setZoom(16);

                          // Find and click the marker
                          const marker = markersRef.current.find(
                            m => m.getTitle() === mosque.name
                          );
                          if (marker) {
                            window.google.maps.event.trigger(marker, 'click');
                          }
                        }
                      }}
                    >
                      <div className="font-medium">{mosque.name}</div>
                      <div className="text-xs text-gray-500 flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {mosque.city}, {mosque.state}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    No mosques match your search
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Map and Details */}
        <div className="md:col-span-3 space-y-4">
          <Card className="overflow-hidden">
            <div ref={mapRef} style={{ height: '500px', width: '100%' }}></div>
          </Card>

          {selectedMosque && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{selectedMosque.name}</CardTitle>
                    <CardDescription className="flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      {selectedMosque.address}, {selectedMosque.city}, {selectedMosque.state} {selectedMosque.zipCode}
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedMosque(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    {selectedMosque.description && (
                      <div className="mb-4">
                        <div className="text-sm font-medium mb-1 flex items-center">
                          <Info className="h-4 w-4 mr-1" />
                          Description
                        </div>
                        <p className="text-sm text-gray-600">
                          {selectedMosque.description}
                        </p>
                      </div>
                    )}

                    <div className="space-y-2">
                      {selectedMosque.phone && (
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-2 text-gray-400" />
                          <span className="text-sm">{selectedMosque.phone}</span>
                        </div>
                      )}

                      {selectedMosque.email && (
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-2 text-gray-400" />
                          <span className="text-sm">{selectedMosque.email}</span>
                        </div>
                      )}

                      {selectedMosque.website && (
                        <div className="flex items-center">
                          <Globe className="h-4 w-4 mr-2 text-gray-400" />
                          <a
                            href={selectedMosque.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-green-600 hover:underline"
                          >
                            {selectedMosque.website}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {showFeatures && selectedMosque.facilityFeatures && selectedMosque.facilityFeatures.length > 0 && (
                    <div>
                      <div className="text-sm font-medium mb-2">Facilities</div>
                      <div className="flex flex-wrap gap-2">
                        {selectedMosque.facilityFeatures.map((feature, index) => (
                          <Badge key={index} variant="outline">
                            {feature.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t flex justify-end">
                  <Link href={`/mosques/${selectedMosque._id}`} target="_blank">
                    <Button size="sm">View Detail Page</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
