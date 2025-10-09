'use client';

import Image from 'next/image';

export function ZoneExplorerClient({ apiKey }: { apiKey?: string }) {
  if (!apiKey) {
    return (
      <div className="relative h-full w-full">
        <Image
          src="https://picsum.photos/seed/zone-explorer/1200/800"
          alt="Placeholder map"
          fill
          style={{ objectFit: 'cover' }}
          data-ai-hint="map abstract"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 p-8 backdrop-blur-sm">
          <div className="rounded-lg bg-card/90 p-8 text-center shadow-lg">
            <h2 className="text-2xl font-bold text-card-foreground">
              Google Maps API Key Missing
            </h2>
            <p className="mt-2 text-muted-foreground">
              Please add your Google Maps API key to a <code>.env.local</code>{' '}
              file to see the map.
            </p>
            <pre className="mt-4 rounded-md bg-background p-4 text-left text-sm text-card-foreground">
              {`NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="YOUR_API_KEY_HERE"`}
            </pre>
          </div>
        </div>
      </div>
    );
  }

  // In a real scenario, you would still want to render the map if the key is present.
  // For this request, we are assuming the key is not present and showing a placeholder.
  return (
    <div className="relative h-full w-full">
      <Image
        src="https://picsum.photos/seed/zone-explorer/1200/800"
        alt="Placeholder map"
        fill
        style={{ objectFit: 'cover' }}
        data-ai-hint="map abstract"
      />
    </div>
  );
}
