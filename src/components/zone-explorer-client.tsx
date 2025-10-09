'use client';

import Image from 'next/image';

export function ZoneExplorerClient() {
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
