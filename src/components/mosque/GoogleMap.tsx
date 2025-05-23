"use client";

import { useState, useRef, useEffect } from 'react';

// Define map container style
const mapContainerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '0.5rem',
};

// Define the prop types
interface MapProps {
  mosques: Array<{
    _id: string;
    name: string;
    address: string;
    city: string;
    location?: {
      type: string;
      coordinates: [number, number];
    };
  }>;
}

export default function MosqueMap({ mosques }: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const apiKey = 'AIzaSyBNLrJhOMz6idD05pzfn5lhA-TAw-mAZCU';

  // Load the Google Maps script
  useEffect(() => {
    // Don't load if already loaded or already trying to load
    if (window.google?.maps || document.querySelector('script[src*="maps.googleapis.com/maps/api"]')) {
      setScriptLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&loading=async`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      setScriptLoaded(true);
    };

    script.onerror = () => {
      setLoadError('Failed to load Google Maps API');
    };

    document.head.appendChild(script);

    return () => {
      // Cleanup only if script was added by this component
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [apiKey]);

  // Initialize map after script is loaded
  useEffect(() => {
    if (!scriptLoaded || !mapRef.current || map) return;

    try {
      // Default center (London)
      const defaultCenter = { lat: 51.5074, lng: -0.1278 };

      // Create new map instance
      const mapInstance = new window.google.maps.Map(mapRef.current, {
        zoom: 7,
        center: defaultCenter,
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: true,
      });

      setMap(mapInstance);
      setLoaded(true);
    } catch (error) {
      console.error('Error initializing map:', error);
      setLoadError('Failed to initialize Google Maps');
    }
  }, [scriptLoaded, map]);

  // Add markers when map and mosques are available
  useEffect(() => {
    if (!map || !loaded || markers.length > 0) return;

    // Clear any existing markers
    markers.forEach(marker => marker.setMap(null));

    const newMarkers: google.maps.Marker[] = [];
    const bounds = new google.maps.LatLngBounds();
    let markersAdded = 0;

    // Add markers for each mosque with valid coordinates
    mosques.forEach(mosque => {
      if (mosque.location?.coordinates &&
          mosque.location.coordinates[0] !== 0 &&
          mosque.location.coordinates[1] !== 0) {

        try {
          const position = {
            lat: mosque.location.coordinates[1], // Latitude is second in GeoJSON
            lng: mosque.location.coordinates[0]  // Longitude is first in GeoJSON
          };

          // Create marker
          const marker = new google.maps.Marker({
            position,
            map,
            title: mosque.name,
            animation: google.maps.Animation.DROP
          });

          // Create info window content
          const contentString = `
            <div style="max-width: 200px;">
              <h3 style="margin: 0 0 5px; font-size: 16px;">${mosque.name}</h3>
              <p style="margin: 0 0 5px; font-size: 12px;">${mosque.address}, ${mosque.city}</p>
              <a href="/mosques/${mosque._id}" style="font-size: 12px; color: #1d4ed8;">View Details</a>
            </div>
          `;

          // Create info window
          const infoWindow = new google.maps.InfoWindow({
            content: contentString
          });

          // Add click listener to open info window
          marker.addListener('click', () => {
            infoWindow.open(map, marker);
          });

          newMarkers.push(marker);
          bounds.extend(position);
          markersAdded++;
        } catch (error) {
          console.error('Error creating marker:', error);
        }
      }
    });

    // Fit bounds if we added any markers
    if (markersAdded > 0) {
      map.fitBounds(bounds);

      // If only one marker, zoom out a bit
      if (markersAdded === 1) {
        google.maps.event.addListenerOnce(map, 'bounds_changed', () => {
          map.setZoom(Math.min(14, map.getZoom() || 10));
        });
      }
    }

    setMarkers(newMarkers);

    // Cleanup function to remove markers when component unmounts
    return () => {
      newMarkers.forEach(marker => {
        if (marker) marker.setMap(null);
      });
    };
  }, [map, mosques, loaded, markers.length]);

  // Show error state
  if (loadError) {
    return (
      <div className="w-full h-[400px] rounded-lg mb-8 bg-gray-100 overflow-hidden">
        <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center">
          <div className="text-amber-600 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
          </div>
          <h3 className="text-lg font-medium">Map API Configuration Required</h3>
          <p className="text-gray-600 max-w-md mt-2">
            The Google Maps API key needs to be configured for this domain.
            Please update the API key settings in the Google Cloud Console to include this domain.
          </p>
          <p className="mt-4 text-sm text-gray-500">
            Domain to authorize: <code className="bg-gray-200 px-2 py-1 rounded">{typeof window !== 'undefined' ? window.location.origin : ''}</code>
          </p>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {mosques.slice(0, 6).map(mosque => (
              <div key={mosque._id} className="bg-white p-2 rounded shadow-sm text-left text-sm">
                <div className="font-medium">{mosque.name}</div>
                <div className="text-gray-500 text-xs truncate">{mosque.address}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Show loading state
  if (!loaded) {
    return (
      <div className="w-full h-[400px] rounded-lg mb-8 bg-gray-100 flex items-center justify-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-green-600 border-r-transparent"></div>
        <p className="ml-2 text-gray-600">Loading map...</p>
      </div>
    );
  }

  // Render map
  return (
    <div className="w-full h-[400px] rounded-lg mb-8 overflow-hidden">
      <div ref={mapRef} style={mapContainerStyle} />
    </div>
  );
}
