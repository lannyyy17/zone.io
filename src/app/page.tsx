import dynamic from 'next/dynamic';
import { networkSignals } from '@/lib/network-data';
import { AnimatedBackground } from '@/components/animated-background';

const MapView = dynamic(() => import('@/components/map-view'), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-muted" />,
});

export default function Home() {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  return (
    <main className="flex min-h-screen flex-col lg:flex-row bg-background">
      <div className="relative flex h-64 w-full flex-col items-center justify-center overflow-hidden bg-primary p-8 text-center lg:h-screen lg:w-[480px]">
        <AnimatedBackground />
        <h1 className="relative z-10 text-5xl font-bold text-primary-foreground font-headline">
          Zone Explorer
        </h1>
        <p className="relative z-10 mt-4 max-w-sm text-lg text-primary-foreground/90">
          Your network&apos;s blind spots, revealed. Crowdsourced signal mapping for better networks.
        </p>
      </div>
      <div className="flex-1 bg-muted">
        {apiKey ? (
          <MapView data={networkSignals} apiKey={apiKey} />
        ) : (
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
        )}
      </div>
    </main>
  );
}
