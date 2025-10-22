'use client';

import Image from 'next/image';
import type { NetworkSignal } from '@/lib/types';
import { useMemo } from 'react';

// Helper to normalize coordinates to a 0-100 scale
const normalize = (value: number, min: number, max: number) => {
  if (max === min) return 50; // Avoid division by zero
  return ((value - min) / (max - min)) * 100;
};

// Helper to determine color based on signal strength
function getSignalColor(signal: number): string {
    if (signal >= -60) return 'rgba(0, 255, 0, 0.6)'; // Green for Excellent
    if (signal >= -75) return 'rgba(173, 255, 47, 0.6)'; // Green-Yellow for Good
    if (signal >= -90) return 'rgba(255, 255, 0, 0.6)'; // Yellow for Fair
    if (signal >= -100) return 'rgba(255, 165, 0, 0.6)'; // Orange for Poor
    return 'rgba(255, 0, 0, 0.6)'; // Red for Unusable
}

interface HeatmapPoint {
  x: number;
  y: number;
  color: string;
}

export default function MapView({ data }: { data: NetworkSignal[] }) {
  const heatmapPoints = useMemo<HeatmapPoint[]>(() => {
    if (!data || data.length === 0) {
      return [];
    }

    // Find the bounding box of the coordinates
    const latitudes = data.map(d => d.latitude);
    const longitudes = data.map(d => d.longitude);
    const minLat = Math.min(...latitudes);
    const maxLat = Math.max(...latitudes);
    const minLon = Math.min(...longitudes);
    const maxLon = Math.max(...longitudes);

    // Normalize coordinates and generate points
    return data.map(d => ({
      x: normalize(d.longitude, minLon, maxLon),
      y: normalize(d.latitude, minLat, maxLat),
      color: getSignalColor(d.signalStrength),
    }));
  }, [data]);

  return (
    <div className="h-full w-full bg-muted flex items-center justify-center relative rounded-lg overflow-hidden">
      <Image
        src="https://picsum.photos/seed/satellite/1200/800"
        alt="Satellite map background"
        layout="fill"
        objectFit="cover"
        data-ai-hint="satellite map"
      />
      <div className="absolute inset-0">
        {heatmapPoints.map((point, index) => (
          <div
            key={index}
            className="absolute rounded-full"
            style={{
              left: `${point.x}%`,
              // We invert the Y-axis because screen coordinates start from top-left
              top: `${100 - point.y}%`, 
              width: '40px',
              height: '40px',
              backgroundColor: point.color,
              transform: 'translate(-50%, -50%)',
              filter: 'blur(10px)',
            }}
          />
        ))}
      </div>
       {heatmapPoints.length === 0 && (
         <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <p className="text-white/80 text-lg font-medium bg-black/50 px-4 py-2 rounded-md">No signal data to display on map</p>
        </div>
      )}
    </div>
  );
}