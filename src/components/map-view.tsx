'use client';

import { APIProvider, Map } from '@vis.gl/react-google-maps';

type MapViewProps = {
  apiKey: string;
};

export function MapView({ apiKey }: MapViewProps) {
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
        />
      </APIProvider>
    </div>
  );
}

export default MapView;
