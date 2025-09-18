import { AnimatedBackground } from '@/components/animated-background';
import { ZoneExplorerClient } from '@/components/zone-explorer-client';

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
        <ZoneExplorerClient apiKey={apiKey} />
      </div>
    </main>
  );
}
