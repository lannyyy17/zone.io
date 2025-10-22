'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Gauge, Zap, Server } from 'lucide-react';

export function DownloadSpeedMonitor() {
  const [speed, setSpeed] = useState<number | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    const measureSpeed = async () => {
      setIsTesting(true);
      const startTime = Date.now();
      try {
        // Fetch a 1MB file from our API endpoint
        const response = await fetch(`/api/download-test?_=${startTime}`, { cache: 'no-store' });
        const blob = await response.blob();
        const endTime = Date.now();

        const durationInSeconds = (endTime - startTime) / 1000;
        const sizeInBits = blob.size * 8;
        const speedInBps = sizeInBits / durationInSeconds;
        const speedInMbps = speedInBps / 1000 / 1000;

        setSpeed(speedInMbps);
      } catch (error) {
        console.error('Download speed measurement failed:', error);
        setSpeed(null);
      } finally {
        setIsTesting(false);
      }
    };

    measureSpeed(); // Initial test
    const interval = setInterval(measureSpeed, 10000); // Test every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const getSpeedColor = () => {
    if (speed === null) return 'text-muted-foreground';
    if (speed > 100) return 'text-green-400';
    if (speed > 25) return 'text-yellow-400';
    return 'text-red-500';
  };

  return (
    <Card className="hover:bg-muted/50 transition-all hover:scale-105">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle className="flex items-center gap-2 font-headline">
                <Gauge />
                Download Speed
            </CardTitle>
            <CardDescription>
                Your current throughput from the server.
            </CardDescription>
        </div>
        <Server className="size-8 text-primary" />
      </CardHeader>
      <CardContent className="flex items-center justify-center p-6">
        {isTesting && speed === null ? (
            <div className="h-10 w-10 animate-pulse rounded-full bg-muted" />
        ) : (
            <div className={`text-4xl font-bold ${getSpeedColor()}`}>
                {speed !== null ? `${speed.toFixed(2)} Mbps` : 'N/A'}
            </div>
        )}
      </CardContent>
    </Card>
  );
}
