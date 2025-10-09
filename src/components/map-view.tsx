'use client';

import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect, useRef, useState } from 'react';
import type { SignalData } from './raw-data-table';

// Fix for default icon path issue in Next.js with Leaflet
const iconRetinaUrl = '/leaflet/marker-icon-2x.png';
const iconUrl = '/leaflet/marker-icon.png';
const shadowUrl = '/leaflet/marker-shadow.png';

const DefaultIcon = L.icon({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapViewProps {
  center: [number, number];
  zoom: number;
  data: SignalData[];
}

function getRssiColor(rssi: number): string {
  if (rssi > -90) return '#4caf50'; // Good signal (green)
  if (rssi > -100) return '#ff9800'; // Fair signal (orange)
  return '#f44336'; // Poor signal (red)
}

export default function MapView({ center, zoom, data }: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (mapRef.current) {
        return;
    }
    
    const map = L.map('map', {
        center: center,
        zoom: zoom,
        scrollWheelZoom: true,
    });
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    mapRef.current = map;
    setMapReady(true);
    
    return () => {
        if (mapRef.current) {
            mapRef.current.remove();
            mapRef.current = null;
        }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (mapReady && mapRef.current) {
        mapRef.current.setView(center, zoom);
    }
  }, [center, zoom, mapReady]);

  useEffect(() => {
    if (mapReady && mapRef.current) {
      // Clear existing markers
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];

      // Add new markers from data
      const newMarkers = data.map(point => {
        const marker = L.marker([point.latitude, point.longitude]).addTo(mapRef.current!);
        marker.bindPopup(`<b>${point.carrier}</b><br>RSSI: ${point.rssi} dBm`);

        // Create a custom circle icon
        const circleIcon = L.divIcon({
          html: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="${getRssiColor(point.rssi)}" stroke="black" stroke-width="5" opacity="0.8"/></svg>`,
          className: 'leaflet-div-icon',
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        });
        marker.setIcon(circleIcon);

        return marker;
      });
      markersRef.current = newMarkers;
    }
  }, [data, mapReady, mapRef]);

  return <div id="map" className="h-full w-full" />;
}
