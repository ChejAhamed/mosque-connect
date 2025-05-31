'use client';

import { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation } from 'lucide-react';

export function BusinessMap({ 
  address, 
  coordinates, 
  onLocationSelect, 
  height = '300px',
  interactive = true 
}) {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);

  // Initialize map
  useEffect(() => {
    if (typeof window !== 'undefined' && window.google) {
      initializeMap();
    } else {
      loadGoogleMapsScript();
    }
  }, []);

  // Update map when coordinates change
  useEffect(() => {
    if (map && coordinates && coordinates.length === 2) {
      const [lng, lat] = coordinates;
      const position = { lat, lng };
      
      map.setCenter(position);
      map.setZoom(15);
      
      if (marker) {
        marker.setPosition(position);
      } else {
        createMarker(position);
      }
    }
  }, [map, coordinates]);

  // Geocode address when it changes
  useEffect(() => {
    if (map && address && (!coordinates || coordinates.length === 0)) {
      geocodeAddress();
    }
  }, [map, address]);

  const loadGoogleMapsScript = () => {
    if (document.querySelector('script[src*="maps.googleapis.com"]')) {
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = initializeMap;
    script.onerror = () => setError('Failed to load Google Maps');
    document.head.appendChild(script);
  };

  const initializeMap = () => {
    try {
      if (!mapRef.current || !window.google) return;

      // Default coordinates (center of US)
      let center = { lat: 39.8283, lng: -98.5795 };
      let zoom = 4;

      // Use provided coordinates if available
      if (coordinates && coordinates.length === 2) {
        const [lng, lat] = coordinates;
        center = { lat, lng };
        zoom = 15;
      }

      const mapInstance = new window.google.maps.Map(mapRef.current, {
        center,
        zoom,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControl: interactive,
        scrollwheel: interactive,
        disableDoubleClickZoom: !interactive,
        draggable: interactive
      });

      setMap(mapInstance);

      // Add click listener for interactive maps
      if (interactive && onLocationSelect) {
        mapInstance.addListener('click', (event) => {
          const lat = event.latLng.lat();
          const lng = event.latLng.lng();
          
          // Update marker position
          if (marker) {
            marker.setPosition({ lat, lng });
          } else {
            createMarker({ lat, lng });
          }
          
          // Call callback with coordinates [lng, lat] (GeoJSON format)
          onLocationSelect([lng, lat]);
        });
      }

      // Create marker if coordinates exist
      if (coordinates && coordinates.length === 2) {
        const [lng, lat] = coordinates;
        createMarker({ lat, lng });
      }

      setIsLoaded(true);
    } catch (error) {
      console.error('Error initializing map:', error);
      setError('Failed to initialize map');
    }
  };

  const createMarker = (position) => {
    if (!map) return;

    const newMarker = new window.google.maps.Marker({
      position,
      map,
      title: address?.street || 'Business Location',
      draggable: interactive
    });

    if (interactive && onLocationSelect) {
      newMarker.addListener('dragend', (event) => {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        onLocationSelect([lng, lat]);
      });
    }

    setMarker(newMarker);
  };

  const geocodeAddress = () => {
    if (!map || !address || !window.google) return;

    const geocoder = new window.google.maps.Geocoder();
    const fullAddress = `${address.street}, ${address.city}, ${address.state} ${address.zipCode}`;

    geocoder.geocode({ address: fullAddress }, (results, status) => {
      if (status === 'OK' && results[0]) {
        const location = results[0].geometry.location;
        const lat = location.lat();
        const lng = location.lng();
        
        map.setCenter({ lat, lng });
        map.setZoom(15);
        
        if (marker) {
          marker.setPosition({ lat, lng });
        } else {
          createMarker({ lat, lng });
        }
        
        // Auto-update coordinates if callback provided
        if (onLocationSelect) {
          onLocationSelect([lng, lat]);
        }
      } else {
        console.error('Geocoding failed:', status);
      }
    });
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        if (map) {
          map.setCenter({ lat, lng });
          map.setZoom(15);
          
          if (marker) {
            marker.setPosition({ lat, lng });
          } else {
            createMarker({ lat, lng });
          }
          
          if (onLocationSelect) {
            onLocationSelect([lng, lat]);
          }
        }
      },
      (error) => {
        console.error('Error getting location:', error);
        setError('Failed to get current location');
      }
    );
  };

  if (error) {
    return (
      <div 
        className="flex items-center justify-center bg-gray-100 border border-gray-300 rounded-lg"
        style={{ height }}
      >
        <div className="text-center">
          <MapPin className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div
        ref={mapRef}
        style={{ height }}
        className="w-full rounded-lg border border-gray-300"
      />
      
      {!isLoaded && (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg"
        >
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Loading map...</p>
          </div>
        </div>
      )}
      
      {interactive && isLoaded && (
        <button
          onClick={handleGetCurrentLocation}
          className="absolute top-2 right-2 bg-white border border-gray-300 rounded-lg p-2 shadow-sm hover:bg-gray-50 transition-colors"
          title="Use current location"
        >
          <Navigation className="h-4 w-4 text-gray-600" />
        </button>
      )}
    </div>
  );
}