'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from './ui/card';
import { Gauge, Play, Pause } from 'lucide-react';
import { Button } from './ui/button';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';

type SpeedMeasurement = {
  time: string;
  speed: number;
};

const MAX_HISTORY_LENGTH = 30; // Keep last 30 data points (5 minutes if 10s interval)

export function DownloadSpeedMonitor() {
  const [speedHistory, setSpeedHistory] = useState<SpeedMeasurement[]>([]);
  const [isTesting, setIsTesting] = useState(false);
  const [isMonitoring, setIsMonitoring] = useState(true);

  const currentSpeed = speedHistory.length > 0 ? speedHistory[speedHistory.length - 1].speed : null;

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    const measureSpeed = async () => {
      setIsTesting(true);
      const startTime = Date.now();
      try {
        const response = await fetch(`/api/download-test?_=${startTime}`, { cache: 'no-store' });
        const blob = await response.blob();
        const endTime = Date.now();

        const durationInSeconds = (endTime - startTime) / 1000;
        const sizeInBits = blob.size * 8;
        const speedInBps = sizeInBits / durationInSeconds;
        const speedInMbps = speedInBps / 1000 / 1000;

        setSpeedHistory(prevHistory => {
            const newMeasurement: SpeedMeasurement = {
                time: new Date().toLocaleTimeString(),
                speed: parseFloat(speedInMbps.toFixed(2))
            };
            const updatedHistory = [...prevHistory, newMeasurement];
            if (updatedHistory.length > MAX_HISTORY_LENGTH) {
                return updatedHistory.slice(updatedHistory.length - MAX_HISTORY_LENGTH);
            }
            return updatedHistory;
        });

      } catch (error) {
        console.error('Download speed measurement failed:', error);
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

  const getSpeedColor = (speedValue: number | null) => {
    if (speedValue === null) return 'text-muted-foreground';
    if (speedValue > 100) return 'text-green-400';
    if (speedValue > 25) return 'text-yellow-400';
    return 'text-red-500';
  };

  const chartConfig = {
    speed: {
      label: 'Speed (Mbps)',
      color: 'hsl(var(--primary))',
    },
  };
  

  return (
    <Card className="hover:bg-muted/50 transition-all hover:scale-105 flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex-1">
            <CardTitle className="flex items-center gap-2 font-headline">
                <Gauge />
                Download Speed
            </CardTitle>
            <CardDescription>
                Live throughput from the server.
            </CardDescription>
        </div>
        <div className="flex items-center gap-2">
            <div className={`text-lg font-bold ${getSpeedColor(currentSpeed)}`}>
                {currentSpeed !== null ? `${currentSpeed.toFixed(2)} Mbps` : (isMonitoring ? 'N/A' : 'Paused')}
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
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 items-center justify-center p-0">
        {isTesting && speedHistory.length === 0 ? (
          <div className="flex h-full min-h-48 w-full items-center justify-center">
            <p className="text-muted-foreground">Measuring initial speed...</p>
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-48 w-full">
            <AreaChart 
                data={speedHistory}
                margin={{ top: 5, right: 20, left: -10, bottom: 0 }}
            >
                <CartesianGrid vertical={false} />
                <XAxis 
                    dataKey="time" 
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value, index) => index % 5 === 0 ? value : ''} // Show every 5th label
                />
                <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    domain={[0, 'dataMax + 20']}
                />
                <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dot" />}
                />
                 <defs>
                    <linearGradient id="fillSpeed" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                    </linearGradient>
                </defs>
                <Area
                    dataKey="speed"
                    type="natural"
                    fill="url(#fillSpeed)"
                    stroke="hsl(var(--primary))"
                    stackId="a"
                />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
