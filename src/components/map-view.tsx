'use client';

import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';
import L from 'leaflet';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { useEffect } from 'react';
import type { NetworkSignal } from '@/lib/types';

// This component will handle map view changes
function MapUpdater({
  center,
  zoom,
  points,
}: {
  center: [number, number];
  zoom: number;
  points: NetworkSignal[];
}) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);

  useEffect(() => {
    // Clear existing heatmap layers before adding a new one
    map.eachLayer((layer) => {
      if ((layer as any)._heat) {
        map.removeLayer(layer);
      }
    });

    if (points && points.length > 0) {
      const addressPoints: [number, number, number][] = points.map((p) => [
        p.latitude,
        p.longitude,
        // Normalize signal strength to a 0-1 scale for intensity
        // Assuming RSSI range from -100 (weakest) to -30 (strongest)
        (p.signalStrength - -100) / (-30 - -100),
      ]);

      (L as any).heatLayer(addressPoints, {
        radius: 25,
        blur: 15,
        maxZoom: 18,
        gradient: { 0.4: 'blue', 0.65: 'lime', 1: 'red' }
      }).addTo(map);
    }
  }, [points, map]);

  return null;
}

interface MapViewProps {
  center: [number, number];
  zoom: number;
  points: NetworkSignal[];
}

export default function MapView({ center, zoom, points = [] }: MapViewProps) {
  useEffect(() => {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl:
        'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl:
        'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });
  }, []);

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
      <MapUpdater center={center} zoom={zoom} points={points} />
    </MapContainer>
  );
}
