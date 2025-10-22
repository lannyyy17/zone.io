'use client';

import type { NetworkSignal } from '@/lib/types';
import { useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Circle, FeatureGroup, useMap } from 'react-leaflet';
import type { LatLngBounds } from 'leaflet';

function getSignalColor(signal: number): string {
    if (signal >= -60) return 'rgba(0, 255, 0, 0.6)'; // Green for Excellent
    if (signal >= -75) return 'rgba(173, 255, 47, 0.6)'; // Green-Yellow for Good
    if (signal >= -90) return 'rgba(255, 255, 0, 0.6)'; // Yellow for Fair
    if (signal >= -100) return 'rgba(255, 165, 0, 0.6)'; // Orange for Poor
    return 'rgba(255, 0, 0, 0.6)'; // Red for Unusable
}

interface HeatmapPoint {
  lat: number;
  lng: number;
  color: string;
}

interface MapUpdaterProps {
  bounds: LatLngBounds | null;
  center: { lat: number; lng: number };
}

function MapUpdater({ bounds, center }: MapUpdaterProps) {
  const map = useMap();
  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds);
    } else {
      map.setView(center, 13);
    }
  }, [bounds, center, map]);
  return null;
}


export default function MapView({ data }: { data: NetworkSignal[] }) {
  const { points, center, bounds } = useMemo(() => {
    if (!data || data.length === 0) {
      return { 
        points: [], 
        center: { lat: 51.505, lng: -0.09 },
        bounds: null
      };
    }

    let minLat = Infinity, maxLat = -Infinity, minLon = Infinity, maxLon = -Infinity;
    
    const processedPoints: HeatmapPoint[] = data.map(d => {
      minLat = Math.min(minLat, d.latitude);
      maxLat = Math.max(maxLat, d.latitude);
      minLon = Math.min(minLon, d.longitude);
      maxLon = Math.max(maxLon, d.longitude);
      
      return {
        lat: d.latitude,
        lng: d.longitude,
        color: getSignalColor(d.signalStrength),
      };
    });

    const calculatedBounds: LatLngBounds | null = (minLat !== Infinity) 
      ? new (require('leaflet')).LatLngBounds([[minLat, minLon], [maxLat, maxLon]])
      : null;

    const calculatedCenter = calculatedBounds ? calculatedBounds.getCenter() : { lat: 51.505, lng: -0.09 };

    return { points: processedPoints, center: calculatedCenter, bounds: calculatedBounds };
  }, [data]);

  return (
    <MapContainer center={center} zoom={13} scrollWheelZoom={false} className="h-full w-full rounded-lg">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapUpdater bounds={bounds} center={center} />
      <FeatureGroup>
        {points.map((point, index) => (
          <Circle
            key={index}
            center={[point.lat, point.lng]}
            pathOptions={{
              color: point.color,
              fillColor: point.color,
              fillOpacity: 0.5,
              weight: 0,
            }}
            radius={30} // Radius in meters
          />
        ))}
      </FeatureGroup>
      {points.length === 0 && (
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-[1000] pointer-events-none">
          <p className="text-white/80 text-lg font-medium bg-black/50 px-4 py-2 rounded-md">No signal data to display on map</p>
        </div>
      )}
    </MapContainer>
  );
}
