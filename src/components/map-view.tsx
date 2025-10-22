'use client';

import type { NetworkSignal } from '@/lib/types';
import { useEffect, memo, useRef } from 'react';
import L, { Map, LayerGroup } from 'leaflet';

// Signal color function remains the same
function getSignalColor(signal: number): string {
  if (signal >= -60) return 'rgba(0, 255, 0, 0.6)'; // Green for Excellent
  if (signal >= -75) return 'rgba(173, 255, 47, 0.6)'; // Green-Yellow for Good
  if (signal >= -90) return 'rgba(255, 255, 0, 0.6)'; // Yellow for Fair
  if (signal >= -100) return 'rgba(255, 165, 0, 0.6)'; // Orange for Poor
  return 'rgba(255, 0, 0, 0.6)'; // Red for Unusable
}

function MapView({ data }: { data: NetworkSignal[] }) {
  // Refs to hold the map instance and the layer group for our heatmap circles
  const mapRef = useRef<Map | null>(null);
  const featureGroupRef = useRef<LayerGroup | null>(null);

  // This effect runs only once on mount to initialize the map
  useEffect(() => {
    // Prevent re-initialization
    if (mapRef.current) return;

    // Initialize the map and set its initial view to San Francisco
    mapRef.current = L.map('map-container', {
      center: [37.7749, -122.4194],
      zoom: 13,
      scrollWheelZoom: false,
    });

    // Add the tile layer from OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(mapRef.current);
    
    // Create a layer group to hold the heatmap circles and add it to the map
    featureGroupRef.current = L.featureGroup().addTo(mapRef.current);
    
    // Cleanup function to remove the map on component unmount
    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []); // Empty dependency array ensures this runs only once

  // This effect runs whenever the signal data changes
  useEffect(() => {
    const map = mapRef.current;
    const featureGroup = featureGroupRef.current;
    
    // Don't do anything if the map or feature group isn't ready
    if (!map || !featureGroup) return;

    // Clear any existing circles from the previous render
    featureGroup.clearLayers();

    if (data && data.length > 0) {
        // Add a new circle for each data point
        data.forEach(d => {
            if (d.latitude && d.longitude) {
              L.circle([d.latitude, d.longitude], {
              color: getSignalColor(d.signalStrength),
              fillColor: getSignalColor(d.signalStrength),
              fillOpacity: 0.5,
              weight: 0,
              radius: 5, // Radius in meters
              }).addTo(featureGroup);
            }
        });

        // Calculate the bounds of the new data points
        const bounds = featureGroup.getBounds();
        if (bounds.isValid()) {
            // Fit the map view to the new bounds
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 19 });
        }
    } else {
        // If there's no data, reset to a default view (San Francisco)
        map.setView([37.7749, -122.4194], 13);
    }
  }, [data]); // This effect re-runs only when the 'data' prop changes

  return (
    <div className="relative h-full w-full">
      <div id="map-container" className="h-full w-full rounded-lg z-[1]"></div>
      {(!data || data.length === 0) && (
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-[2] pointer-events-none rounded-lg">
          <p className="text-white/80 text-lg font-medium bg-black/50 px-4 py-2 rounded-md">
            No signal data to display on map
          </p>
        </div>
      )}
    </div>
  );
}

export default memo(MapView);
