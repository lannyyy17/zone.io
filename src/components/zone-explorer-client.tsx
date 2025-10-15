'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DownloadIcon, Wifi, TrendingUp, TrendingDown, Hash, Bot, Loader2 } from 'lucide-react';
import React, { useMemo, useState, useEffect } from 'react';
import type { NetworkSignal } from '@/lib/types';
import { useSelectedSession } from '@/hooks/use-selected-session';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { mockNetworkSignals, generateMockSignal } from '@/lib/mock-data';
import { Badge } from './ui/badge';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';
import { summarizeSession } from '@/ai/flows/summarize-session-flow';
import { toast } from '@/hooks/use-toast';
import { getAddressFromCoordinates } from '@/services/geocoding';
import MapView from './map-view';


function getSignalQuality(signal: number): {
  label: 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Unusable';
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
  color: string;
} {
    if (signal >= -60) return { label: 'Excellent', variant: 'default', color: 'bg-green-500' };
    if (signal >= -75) return { label: 'Good', variant: 'default', color: 'bg-lime-500' };
    if (signal >= -90) return { label: 'Fair', variant: 'secondary', color: 'bg-yellow-500' };
    if (signal >= -100) return { label: 'Poor', variant: 'outline', color: 'bg-orange-500' };
    return { label: 'Unusable', variant: 'destructive', color: 'bg-red-500' };
}

function SessionStats({ data }: { data: NetworkSignal[] }) {
    const stats = useMemo(() => {
        if (!data || data.length === 0) {
            return {
                average: 0,
                strongest: 0,
                weakest: 0,
                count: 0
            };
        }
        const signals = data.map(d => d.signalStrength);
        return {
            average: Math.round(signals.reduce((a, b) => a + b, 0) / signals.length),
            strongest: Math.max(...signals),
            weakest: Math.min(...signals),
            count: signals.length
        }
    }, [data]);

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg Signal</CardTitle>
                    <Wifi className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.average} dBm</div>
                    <p className="text-xs text-muted-foreground">Average signal strength</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Strongest</CardTitle>
                    <TrendingUp className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.strongest} dBm</div>
                    <p className="text-xs text-muted-foreground">Peak signal recorded</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Weakest</CardTitle>
                    <TrendingDown className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.weakest} dBm</div>
                    <p className="text-xs text-muted-foreground">Lowest signal recorded</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Data Points</CardTitle>
                    <Hash className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.count}</div>
                    <p className="text-xs text-muted-foreground">Total signals collected</p>
                </CardContent>
            </Card>
        </div>
    )
}

const chartConfig = {
    signal: {
      label: 'Signal (dBm)',
      color: 'hsl(var(--primary))',
    },
};

function SignalChart({ data }: { data: NetworkSignal[] }) {
    const chartData = useMemo(() => {
        if (!data) return [];
        return data.map(d => ({
            time: new Date(d.timestamp).toLocaleTimeString(),
            signal: d.signalStrength
        })).reverse();
    }, [data]);

    return (
        <Card className="mb-4">
            <CardHeader>
                <CardTitle>Signal Strength Over Time</CardTitle>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="h-64 w-full">
                  <AreaChart data={chartData} margin={{ left: -20, right: 20, top: 5, bottom: 5 }}>
                      <CartesianGrid vertical={false} />
                      <XAxis
                        dataKey="time"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        tickFormatter={(value) => value}
                      />
                      <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent indicator="dot" />}
                      />
                      <Area
                        dataKey="signal"
                        type="natural"
                        fill="hsl(var(--primary))"
                        fillOpacity={0.4}
                        stroke="hsl(var(--primary))"
                        stackId="a"
                      />
                  </AreaChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}

export function ZoneExplorerClient() {
  const { selectedSession } = useSelectedSession();
  const [signalData, setSignalData] = useState<NetworkSignal[]>([]);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);

  useEffect(() => {
    if (!selectedSession) {
      setSignalData([]);
      return;
    };

    const initialData = mockNetworkSignals.filter(
      (signal) => signal.sessionId === selectedSession.id
    );
    setSignalData(initialData);

    const isLive = selectedSession.endTime === null;
    let interval: NodeJS.Timeout | undefined;

    if (isLive) {
        interval = setInterval(() => {
            setSignalData(prevData => [...prevData, generateMockSignal(selectedSession.id)])
        }, 5000);
    }

    return () => {
        if (interval) {
            clearInterval(interval)
        }
    }

  }, [selectedSession]);


  const exportToCSV = () => {
    if (!signalData || !selectedSession) return;
    const headers = ['ID,Latitude,Longitude,SignalStrength,Timestamp,Quality'];
    const rows = signalData.map(
      (d) =>
        `${d.id},${d.latitude},${d.longitude},${d.signalStrength},${new Date(
          d.timestamp
        ).toISOString()},${getSignalQuality(d.signalStrength).label}`
    );
    const csvContent =
      'data:text/csv;charset=utf-8,' + headers.concat(rows).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `session_${selectedSession?.locationName?.replace(/ /g, '_') ?? selectedSession?.id}_signals.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAiSummary = async () => {
    if (!signalData) return;
    setIsAiLoading(true);
    setAiSummary(null);
    try {
        const result = await summarizeSession({ signals: signalData });
        setAiSummary(result.summary);
    } catch(e) {
        console.error(e);
        toast({
            variant: "destructive",
            title: "AI Summary Failed",
            description: "Could not generate AI summary. Please try again later."
        });
    } finally {
        setIsAiLoading(false);
    }
  }

  const handleRowClick = async (signal: NetworkSignal) => {
    setIsGeocoding(true);
    try {
        const address = await getAddressFromCoordinates(signal.latitude, signal.longitude);
        toast({
            title: "Location Details",
            description: address,
        });
    } catch (e) {
        console.error(e);
        toast({
            variant: "destructive",
            title: "Geocoding Failed",
            description: "Could not retrieve address for this point.",
        });
    } finally {
        setIsGeocoding(false);
    }
  }


  const tableData = useMemo(() => {
    if (!signalData) return [];
    return signalData.sort((a, b) => b.timestamp - a.timestamp);
  }, [signalData]);


  return (
    <div className="flex h-screen flex-col">
      <header className="flex h-16 shrink-0 items-center justify-between border-b bg-background px-4 md:px-6">
        <h2 className="truncate text-lg font-bold tracking-tight sm:text-xl md:text-2xl">
          {selectedSession
            ? selectedSession.locationName ?? `Session ${selectedSession.id.slice(0,6)}...`
            : 'Select a Session'}
        </h2>
        <div className="flex items-center gap-2">
            <Button
                onClick={handleAiSummary}
                disabled={!signalData || signalData.length === 0 || isAiLoading}
                size="sm"
                variant="outline"
            >
                {isAiLoading ? <Loader2 className="mr-2 animate-spin" /> : <Bot className="mr-2" />}
                <span className="hidden sm:inline">Get AI Summary</span>
            </Button>
          <Button
            onClick={exportToCSV}
            disabled={!signalData || signalData.length === 0}
            size="sm"
          >
            <DownloadIcon className="mr-2" />
            <span className="hidden sm:inline">Export CSV</span>
          </Button>
        </div>
      </header>
      <main className="flex-1 overflow-auto p-2 sm:p-4 md:p-6">
        {!selectedSession && (
          <Card>
            <CardHeader>
              <CardTitle>Welcome to Zone Explorer</CardTitle>
              <CardDescription>
                Select a mapping session from the sidebar to visualize signal strength.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                Once you have collected data with the Zone.io mobile app, your sessions
                will appear in the sidebar. Click on a session to
                load its data.
              </p>
            </CardContent>
          </Card>
        )}
        {selectedSession && (
            <>
            <SessionStats data={signalData} />
            { isAiLoading && <Card className="mb-4"><CardContent className="p-6"><p className="text-center text-muted-foreground">Generating AI summary...</p></CardContent></Card> }
            { aiSummary && <Card className="mb-4"><CardHeader><CardTitle>AI Summary</CardTitle></CardHeader><CardContent><div className="prose prose-sm dark:prose-invert" dangerouslySetInnerHTML={{ __html: aiSummary.replace(/\n/g, '<br />') }} /></CardContent></Card>}
            <SignalChart data={signalData} />
            <div className="h-64 w-full rounded-lg mb-4">
                <MapView />
            </div>
              <Card>
                <CardHeader>
                  <CardTitle>Raw Signal Data</CardTitle>
                  <CardDescription>
                    Real-time feed of collected signal data points for the selected session. Click a row to geocode.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {tableData && tableData.length > 0 ? (
                    <div className="max-h-[60vh] overflow-auto rounded-lg border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Timestamp</TableHead>
                            <TableHead>Signal (dBm)</TableHead>
                            <TableHead>Quality</TableHead>
                            <TableHead>Latitude</TableHead>
                            <TableHead>Longitude</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {tableData.map((d) => {
                            const quality = getSignalQuality(d.signalStrength);
                            return (
                                <TableRow key={d.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleRowClick(d)}>
                                <TableCell>
                                    {new Date(d.timestamp).toLocaleString()}
                                </TableCell>
                                <TableCell>{d.signalStrength}</TableCell>
                                <TableCell>
                                    <Badge variant={quality.variant}>{quality.label}</Badge>
                                </TableCell>
                                <TableCell>{d.latitude.toFixed(6)}</TableCell>
                                <TableCell>{d.longitude.toFixed(6)}</TableCell>
                                </TableRow>
                            );
                            })}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                     <p>No signal data for this session.</p>
                  )}
                </CardContent>
              </Card>
          </>
        )}
      </main>
    </div>
  );
}

    