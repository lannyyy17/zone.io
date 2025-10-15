'use client';

import Image from 'next/image';

export default function MapView() {
  return (
    <div className="h-full w-full bg-muted flex items-center justify-center relative">
      <Image
        src="https://picsum.photos/seed/heatmap/1200/800"
        alt="Map with heatmap"
        layout="fill"
        objectFit="cover"
        data-ai-hint="satellite map signal strength heatmap"
      />
      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
        <p className="text-white/80 text-lg font-medium bg-black/50 px-4 py-2 rounded-md">Map view is currently disabled</p>
      </div>
    </div>
  );
}
