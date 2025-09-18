'use client';

import { useMemo, useState } from 'react';
import { APIProvider, Map, useMap } from '@vis.gl/react-google-maps';
import { GoogleMapsOverlay } from '@deck.gl/google-maps';
import { HeatmapLayer } from '@deck.gl/layers';
import type { Layer } from 'deck.gl';

type SignalData = {
  latitude: number;
  longitude: number;
  signal_strength: number;
};

type MapViewProps = {
  data: SignalData[];
  apiKey: string;
};

const DeckGLOverlay = ({ layers }: { layers: Layer[] }) => {
  const map = useMap();
  const [overlay] = useState(() => new GoogleMapsOverlay({ interleaving: true }));

  useMemo(() => {
    overlay.setProps({ layers });
    overlay.setMap(map ?? null);
  }, [overlay, layers, map]);

  return null;
};

export function MapView({ data, apiKey }: MapViewProps) {
  const layers = [
    new HeatmapLayer<SignalData>({
      id: 'heatmapLayer',
      data,
      getPosition: (d) => [d.longitude, d.latitude],
      getWeight: (d) => d.signal_strength,
      radiusPixels: 70,
      intensity: 1.5,
      threshold: 0.1,
      colorRange: [
        [147, 112, 219, 0], // MediumPurple, transparent
        [147, 112, 219, 128], // MediumPurple, semi-transparent
        [255, 105, 180, 150], // HotPink
        [255, 69, 180, 200], // Pink
        [255, 20, 147, 255], // DeepPink for strongest signals
      ],
    }),
  ];

  return (
    <div className="h-full w-full">
      <APIProvider apiKey={apiKey}>
        <Map
          defaultCenter={{ lat: 37.7749, lng: -122.4194 }} // San Francisco
          defaultZoom={12}
          gestureHandling={'greedy'}
          disableDefaultUI={true}
          mapId="d3f7f5a774e05b44"
          styles={[
            {
              "featureType": "poi",
              "elementType": "labels",
              "stylers": [{ "visibility": "off" }]
            },
            {
              "featureType": "transit",
              "elementType": "labels",
              "stylers": [{ "visibility": "off" }]
            }
          ]}
        >
          <DeckGLOverlay layers={layers} />
        </Map>
      </APIProvider>
    </div>
  );
}

export default MapView;
