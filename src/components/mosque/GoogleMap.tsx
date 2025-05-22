"use client";

import { useEffect, useRef, useState } from "react";

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

export default function GoogleMap({ mosques }: MapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    // Only load the script once
    if (!window.google && !document.getElementById("google-maps-script")) {
      const script = document.createElement("script");
      script.id = "google-maps-script";
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBNLrJhOMz6idD05pzfn5lhA-TAw-mAZCU&libraries=places&loading=async`;
      script.async = true;
      script.onload = () => setIsLoaded(true);
      script.onerror = () => setLoadError("Failed to load Google Maps API");
      document.head.appendChild(script);
    } else if (window.google) {
      setIsLoaded(true);
    }

    // Cleanup function
    return () => {
      if (mapRef.current) {
        // No need to explicitly destroy the map, just remove reference
        mapRef.current = null;
      }
    };
  }, []);

  // Initialize map when Google Maps API is loaded
  useEffect(() => {
    if (!isLoaded || !mapContainerRef.current || mapRef.current) return;

    try {
      // Default center (London, UK)
      const defaultCenter = { lat: 51.5074, lng: -0.1278 };

      // Create the map
      const map = new window.google.maps.Map(mapContainerRef.current, {
        zoom: 5,
        center: defaultCenter,
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: true,
      });

      mapRef.current = map;

      // Add markers for mosques
      const bounds = new window.google.maps.LatLngBounds();
      let markersAdded = 0;

      mosques.forEach(mosque => {
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
            map,
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
            infoWindow.open(map, marker);
          });

          // Extend bounds to include this marker
          bounds.extend(position);
          markersAdded++;
        }
      });

      // Adjust map view to fit all markers if we have any
      if (markersAdded > 0) {
        map.fitBounds(bounds);

        // If only one marker, zoom out a bit
        if (markersAdded === 1) {
          window.google.maps.event.addListenerOnce(map, 'bounds_changed', () => {
            map.setZoom(Math.min(14, map.getZoom()));
          });
        }
      }
    } catch (error) {
      console.error("Error initializing Google Maps:", error);
      setLoadError("Error initializing map");
    }
  }, [isLoaded, mosques]);

  if (loadError) {
    return (
      <div className="w-full h-[400px] rounded-lg mb-8 bg-gray-100 flex items-center justify-center">
        <div className="text-red-500">
          <p className="font-medium">Map loading error</p>
          <p className="text-sm">{loadError}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={mapContainerRef}
      className="w-full h-[400px] rounded-lg mb-8 bg-gray-100 overflow-hidden"
    >
      {!isLoaded && (
        <div className="w-full h-full flex items-center justify-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-green-600 border-r-transparent"></div>
          <p className="ml-2 text-gray-600">Loading map...</p>
        </div>
      )}
    </div>
  );
}
