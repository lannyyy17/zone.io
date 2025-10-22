'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Wifi } from 'lucide-react';

export function PingMonitor() {
  const [ping, setPing] = useState<number | null>(null);
  const [isPinging, setIsPinging] = useState(false);

  useEffect(() => {
    const measurePing = async () => {
      setIsPinging(true);
      const startTime = Date.now();
      try {
        // We fetch a small, cache-busted resource from the same origin.
        await fetch(`/favicon.ico?_=${startTime}`, { cache: 'no-store' });
        const endTime = Date.now();
        setPing(endTime - startTime);
      } catch (error) {
        console.error('Ping measurement failed:', error);
        setPing(null);
      } finally {
        setIsPinging(false);
      }
    };

    measurePing(); // Initial ping
    const interval = setInterval(measurePing, 5000); // Ping every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const getPingColor = () => {
    if (ping === null) return 'text-muted-foreground';
    if (ping < 50) return 'text-green-500';
    if (ping < 150) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Wifi />
            Real-time Ping
        </CardTitle>
        <CardDescription>
            Your current latency to the server.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-center p-6">
        {isPinging && ping === null ? (
            <div className="h-10 w-10 animate-pulse rounded-full bg-muted" />
        ) : (
            <div className={`text-4xl font-bold ${getPingColor()}`}>
                {ping !== null ? `${ping} ms` : 'N/A'}
            </div>
        )}
      </CardContent>
    </Card>
  );
}
