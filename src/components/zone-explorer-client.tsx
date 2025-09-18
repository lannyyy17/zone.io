'use client';

import dynamic from 'next/dynamic';

const MapView = dynamic(() => import('@/components/map-view'), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-muted" />,
});

export function ZoneExplorerClient({ apiKey }: { apiKey?: string }) {
  if (!apiKey) {
    return (
      <div className="flex h-full w-full items-center justify-center p-8">
        <div className="rounded-lg bg-card p-8 text-center shadow-lg">
          <h2 className="text-2xl font-bold text-card-foreground">Google Maps API Key Missing</h2>
          <p className="mt-2 text-muted-foreground">
            Please add your Google Maps API key to a <code>.env.local</code> file to see the map.
          </p>
          <pre className="mt-4 rounded-md bg-background p-4 text-left text-sm text-card-foreground">
            {`NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="YOUR_API_KEY_HERE"`}
          </pre>
        </div>
      </div>
    );
  }

  return <MapView apiKey={apiKey} />;
}
