'use client';

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect, useRef, useState } from 'react';

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
}

function ChangeView({ center, zoom }: MapViewProps) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [map, center, zoom]);
  return null;
}

export default function MapView({ center, zoom }: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    // This effect runs once on mount to initialize the map
    if (mapRef.current) {
        // if map is already initialized, do nothing
        return;
    }
    // The map container div is rendered by the return statement below.
    // We can then initialize the map on it.
    const map = L.map('map', {
        center: center,
        zoom: zoom,
        scrollWheelZoom: true,
    });
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    L.marker(center).addTo(map)
        .bindPopup('A pretty CSS3 popup. <br /> Easily customizable.');

    mapRef.current = map;
    setMapReady(true);
    
    // Cleanup function to destroy the map instance when the component unmounts
    return () => {
        if (mapRef.current) {
            mapRef.current.remove();
            mapRef.current = null;
        }
    };
  }, []);

  useEffect(() => {
    // This effect runs when center or zoom props change to update the map view
    if (mapReady && mapRef.current) {
        mapRef.current.setView(center, zoom);
    }
  }, [center, zoom, mapReady]);

  return <div id="map" className="h-full w-full" />;
}
