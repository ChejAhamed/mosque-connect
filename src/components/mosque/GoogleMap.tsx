"use client";

import { useCallback, useState } from 'react';
import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from '@react-google-maps/api';

const GOOGLE_MAPS_API_KEY = 'AIzaSyBNLrJhOMz6idD05pzfn5lhA-TAw-mAZCU';
const defaultCenter = { lat: 51.5074, lng: -0.1278 }; // London

const containerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '0.5rem',
};

const options = {
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: true,
  streetViewControl: false,
  fullscreenControl: true,
};

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
  const [selectedMosque, setSelectedMosque] = useState<any | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  // Load the Google Maps JavaScript API
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: ['places']
  });

  // Save map reference and fit bounds
  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);

    // Only fit bounds if we have mosques with valid coordinates
    const bounds = new google.maps.LatLngBounds();
    let markersAdded = 0;

    mosques.forEach(mosque => {
      if (mosque.location?.coordinates &&
          mosque.location.coordinates[0] !== 0 &&
          mosque.location.coordinates[1] !== 0) {
        bounds.extend({
          lat: mosque.location.coordinates[1],
          lng: mosque.location.coordinates[0]
        });
        markersAdded++;
      }
    });

    if (markersAdded > 0) {
      map.fitBounds(bounds);

      // If only one marker, zoom out a bit
      if (markersAdded === 1) {
        google.maps.event.addListenerOnce(map, 'bounds_changed', () => {
          map.setZoom(Math.min(14, map.getZoom() || 10));
        });
      }
    }
  }, [mosques]);

  // Clear reference on unmount
  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // Handle error state
  if (loadError) {
    return (
      <div className="w-full h-[400px] rounded-lg mb-8 bg-gray-100 flex items-center justify-center">
        <div className="text-red-500 text-center">
          <p className="font-medium">Map loading error</p>
          <p className="text-sm">Unable to load Google Maps</p>
        </div>
      </div>
    );
  }

  // Handle loading state
  if (!isLoaded) {
    return (
      <div className="w-full h-[400px] rounded-lg mb-8 bg-gray-100 flex items-center justify-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-green-600 border-r-transparent"></div>
        <p className="ml-2 text-gray-600">Loading map...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[400px] rounded-lg mb-8 overflow-hidden">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={defaultCenter}
        zoom={5}
        options={options}
        onLoad={onLoad}
        onUnmount={onUnmount}
      >
        {mosques.map(mosque => {
          // Only render markers with valid coordinates
          if (mosque.location?.coordinates &&
              mosque.location.coordinates[0] !== 0 &&
              mosque.location.coordinates[1] !== 0) {

            const position = {
              lat: mosque.location.coordinates[1], // Latitude is second in GeoJSON
              lng: mosque.location.coordinates[0]  // Longitude is first in GeoJSON
            };

            return (
              <Marker
                key={mosque._id}
                position={position}
                title={mosque.name}
                animation={google.maps.Animation.DROP}
                onClick={() => setSelectedMosque(mosque)}
              />
            );
          }
          return null;
        })}

        {/* Info Window for selected mosque */}
        {selectedMosque && (
          <InfoWindow
            position={{
              lat: selectedMosque.location.coordinates[1],
              lng: selectedMosque.location.coordinates[0]
            }}
            onCloseClick={() => setSelectedMosque(null)}
          >
            <div style={{ maxWidth: '200px' }}>
              <h3 style={{ margin: '0 0 5px', fontSize: '16px' }}>{selectedMosque.name}</h3>
              <p style={{ margin: '0 0 5px', fontSize: '12px' }}>
                {selectedMosque.address}, {selectedMosque.city}
              </p>
              <a
                href={`/mosques/${selectedMosque._id}`}
                style={{ fontSize: '12px', color: '#1d4ed8' }}
              >
                View Details
              </a>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
}
