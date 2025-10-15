'use client';

import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer } from 'react-leaflet';

interface MapViewProps {
  center: [number, number];
  zoom: number;
  data: (number[])[];
}

export default function MapView({ center, zoom, data }: MapViewProps) {
  
  if (typeof window === 'undefined') {
    return null;
  }

  // Normalize signal strength to a 0-1 scale for intensity.
  // Assuming RSSI range from -100 (weakest) to -30 (strongest).
  const normalizedData = data.map(([lat, lon, strength]) => {
    const intensity = (strength - -100) / (-30 - -100);
    return [lat, lon, Math.max(0, Math.min(1, intensity))]; // Clamp between 0 and 1
  });

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      scrollWheelZoom={true}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {/* HeatmapLayer is temporarily removed to fix the build. We will add a compatible one next. */}
    </MapContainer>
  );
}
