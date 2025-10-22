'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from './ui/card';
import { Gauge, Server, Play, Pause } from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

export function DownloadSpeedMonitor() {
  const [speed, setSpeed] = useState<number | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [isMonitoring, setIsMonitoring] = useState(true);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    const measureSpeed = async () => {
      setIsTesting(true);
      const startTime = Date.now();
      try {
        // Fetch a 10MB file from our API endpoint
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

    if (isMonitoring) {
        measureSpeed(); // Initial test
        interval = setInterval(measureSpeed, 10000); // Test every 10 seconds
    } else {
        if(interval) clearInterval(interval);
    }

    return () => {
        if(interval) clearInterval(interval);
    };
  }, [isMonitoring]);

  const getSpeedColor = () => {
    if (speed === null) return 'text-muted-foreground';
    if (speed > 100) return 'text-green-400';
    if (speed > 25) return 'text-yellow-400';
    return 'text-red-500';
  };

  const speedScale = [
    { label: 'Excellent', range: '> 100 Mbps', color: 'bg-green-500' },
    { label: 'Good', range: '> 25 Mbps', color: 'bg-lime-500' },
    { label: 'Fair', range: '> 5 Mbps', color: 'bg-yellow-500' },
    { label: 'Poor', range: '> 1 Mbps', color: 'bg-orange-500' },
    { label: 'Unusable', range: '< 1 Mbps', color: 'bg-red-500' }
  ];

  return (
    <Card className="hover:bg-muted/50 transition-all hover:scale-105 flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex-1">
            <CardTitle className="flex items-center gap-2 font-headline">
                <Gauge />
                Download Speed
            </CardTitle>
            <CardDescription>
                Your current throughput from the server.
            </CardDescription>
        </div>
        <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMonitoring(!isMonitoring)}
            className="text-muted-foreground hover:text-foreground"
        >
            {isMonitoring ? <Pause className="size-5" /> : <Play className="size-5" />}
            <span className="sr-only">{isMonitoring ? 'Pause' : 'Resume'}</span>
        </Button>
      </CardHeader>
      <CardContent className="flex flex-1 items-center justify-center p-6">
        {isTesting && speed === null ? (
            <div className="h-10 w-10 animate-pulse rounded-full bg-muted" />
        ) : (
            <div className={`text-4xl font-bold ${getSpeedColor()}`}>
                {speed !== null ? `${speed.toFixed(2)} Mbps` : (isMonitoring ? 'N/A' : 'Paused')}
            </div>
        )}
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <p className="text-xs font-semibold text-muted-foreground">Signal Strength Conversion Scale:</p>
        <div className="flex flex-wrap gap-2">
          {speedScale.map(item => (
            <div key={item.label} className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${item.color}`} />
              <span className="font-medium">{item.label}:</span>
              <span className="text-muted-foreground">{item.range}</span>
            </div>
          ))}
        </div>
      </CardFooter>
    </Card>
  );
}
