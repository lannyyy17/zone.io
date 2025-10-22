'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DownloadIcon, Wifi, TrendingUp, TrendingDown, Hash, Bot, Loader2, Edit, Save, Home, MapPin, Scan, Play, Pause } from 'lucide-react';
import React, { useMemo, useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import type { NetworkSignal } from '@/lib/types';
import { useSelectedSession, type CollectionMode } from '@/hooks/use-selected-session';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from './ui/badge';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';
import { summarizeSession } from '@/ai/flows/summarize-session-flow';
import { toast } from '@/hooks/use-toast';
import { getAddressFromCoordinates } from '@/services/geocoding';
import { Input } from './ui/input';
import { useCollection, updateDocumentNonBlocking, addDocumentNonBlocking } from '@/firebase';
import { collection, query, doc } from 'firebase/firestore';
import { useFirebase, useFirestore, useMemoFirebase } from '@/firebase/provider';
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group';
import { cn } from '@/lib/utils';

const MapView = dynamic(() => import('./map-view'), { 
    ssr: false,
    loading: () => <div className="h-full w-full bg-muted flex items-center justify-center"><p>Loading map...</p></div>
});

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

    const statCards = [
        { title: "Avg Signal", value: `${stats.average} dBm`, description: "Average signal strength", icon: <Wifi className="h-4 w-4 text-muted-foreground" /> },
        { title: "Strongest", value: `${stats.strongest} dBm`, description: "Peak signal recorded", icon: <TrendingUp className="h-4 w-4 text-green-500" /> },
        { title: "Weakest", value: `${stats.weakest} dBm`, description: "Lowest signal recorded", icon: <TrendingDown className="h-4 w-4 text-red-500" /> },
        { title: "Data Points", value: stats.count, description: "Total signals collected", icon: <Hash className="h-4 w-4 text-muted-foreground" /> },
    ];


    return (
        <div className="mb-4">
            <div className="lg:hidden">
                <Carousel
                    opts={{
                        align: "start",
                    }}
                    className="w-full"
                >
                    <CarouselContent>
                        {statCards.map((card, index) => (
                            <CarouselItem key={index} className="basis-3/4 sm:basis-1/2">
                                <div className="p-1">
                                    <Card>
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                                            {card.icon}
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">{card.value}</div>
                                            <p className="text-xs text-muted-foreground">{card.description}</p>
                                        </CardContent>
                                    </Card>
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious className="ml-12" />
                    <CarouselNext className="mr-12" />
                </Carousel>
            </div>
            <div className="hidden lg:grid grid-cols-4 gap-4">
                 {statCards.map((card, index) => (
                    <Card key={index}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                            {card.icon}
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{card.value}</div>
                            <p className="text-xs text-muted-foreground">{card.description}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
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
                      <defs>
                        <linearGradient id="fillSignal" x1="0" y1="0" x2="0" y2="1">
                          <stop
                            offset="5%"
                            stopColor="hsl(var(--primary))"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor="hsl(var(--primary))"
                            stopOpacity={0.1}
                          />
                        </linearGradient>
                      </defs>
                      <Area
                        dataKey="signal"
                        type="natural"
                        fill="url(#fillSignal)"
                        stroke="hsl(var(--primary))"
                        stackId="a"
                      />
                  </AreaChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}

const measureDownloadSpeedAndConvertToDb = async (): Promise<number> => {
    const startTime = Date.now();
    try {
        const response = await fetch(`/api/download-test?_=${startTime}`, { cache: 'no-store' });
        const blob = await response.blob();
        const endTime = Date.now();
        
        const durationInSeconds = (endTime - startTime) / 1000;
        const sizeInBits = blob.size * 8;
        const speedInBps = sizeInBits / durationInSeconds;
        const speedInMbps = speedInBps / 1000 / 1000;

        if (speedInMbps > 100) return -50;
        if (speedInMbps > 50) return -65;
        if (speedInMbps > 10) return -80;
        if (speedInMbps > 1) return -95;
        return -110;

    } catch (error) {
        console.error('Download speed measurement failed:', error);
        return -110;
    }
}

function LiveCollectionPanel() {
    const { collectionMode, setCollectionMode, isScanning, setIsScanning } = useSelectedSession();
    const [isPinDropping, setIsPinDropping] = useState(false);
    const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const { user } = useFirebase();
    const firestore = useFirestore();
    const { selectedSession } = useSelectedSession();
    
    const recordSignalPoint = (showToast = true) => {
        if (!navigator.geolocation) {
            toast({ variant: 'destructive', title: 'Geolocation Not Supported', description: 'Your browser does not support geolocation.'});
            return;
        }
    
        if (!user || !firestore || !selectedSession) return;
    
        setIsPinDropping(true);
        if(showToast) toast({ title: 'Measuring Signal...', description: 'Please wait while we test your network speed.' });
        
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                const signalStrength = await measureDownloadSpeedAndConvertToDb();
                const signalsCollection = collection(firestore, 'users', user.uid, 'sessions', selectedSession.id, 'signals');
                const newSignal = { latitude, longitude, signalStrength, timestamp: new Date() };
                addDocumentNonBlocking(signalsCollection, newSignal);
    
                if(showToast) toast({ title: 'Pin Dropped!', description: `Signal recorded at ${latitude.toFixed(4)}, ${longitude.toFixed(4)} with ${signalStrength} dBm`});
                setIsPinDropping(false);
            },
            (error) => {
                if(showToast) toast({ variant: 'destructive', title: 'Geolocation Error', description: error.message });
                setIsPinDropping(false);
            }
        )
    }

    const handleToggleScan = () => {
        setIsScanning(prev => {
            const nowScanning = !prev;
            if (nowScanning) {
                recordSignalPoint(false);
                scanIntervalRef.current = setInterval(() => recordSignalPoint(false), 5000);
                toast({title: "Area Scan Started", description: "Automatically collecting data every 5 seconds."});
            } else {
                if(scanIntervalRef.current) clearInterval(scanIntervalRef.current);
                toast({title: "Area Scan Stopped", description: "Automatic data collection paused."});
            }
            return nowScanning;
        });
    }

    useEffect(() => {
        return () => {
            if (scanIntervalRef.current) {
                clearInterval(scanIntervalRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (collectionMode === 'pinpoint' && isScanning) {
            setIsScanning(false);
            if(scanIntervalRef.current) clearInterval(scanIntervalRef.current);
        }
    }, [collectionMode, isScanning, setIsScanning])


    return (
        <Card className="mb-4 bg-primary/5">
            <CardHeader>
                <CardTitle>Live Collection Controls</CardTitle>
                <CardDescription>Select a mode and start collecting signal data for this session.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <ToggleGroup type="single" value={collectionMode} onValueChange={(value: CollectionMode) => value && setCollectionMode(value)} aria-label="Collection Mode">
                    <ToggleGroupItem value="pinpoint" aria-label="Pinpoint Mode">
                        <MapPin className="mr-2" />
                        Pinpoint
                    </ToggleGroupItem>
                    <ToggleGroupItem value="area" aria-label="Area Scan Mode">
                        <Scan className="mr-2" />
                        Area Scan
                    </ToggleGroupItem>
                </ToggleGroup>

                <div className="h-10 border-l border-border hidden sm:block" />

                {collectionMode === 'pinpoint' ? (
                    <Button onClick={() => recordSignalPoint()} disabled={isPinDropping} size="lg" className="w-full sm:w-auto">
                        {isPinDropping ? <Loader2 className="mr-2 animate-spin" /> : <MapPin className="mr-2" />}
                        Drop Pin
                    </Button>
                ) : (
                    <Button onClick={handleToggleScan} variant={isScanning ? "destructive" : "default"} size="lg" className="w-full sm:w-auto">
                        {isScanning ? <><Pause className="mr-2" />Stop Scan</> : <><Play className="mr-2" />Start Scan</>}
                    </Button>
                )}
            </CardContent>
        </Card>
    )
}

export function ZoneExplorerClient() {
  const { selectedSession, setSelectedSession, isCollecting } = useSelectedSession();
  const { user } = useFirebase();
  const firestore = useFirestore();

  const signalsQuery = useMemoFirebase(() => {
    if (!firestore || !user || !selectedSession?.id) return null;
    return query(collection(firestore, 'users', user.uid, 'sessions', selectedSession.id, 'signals'));
  }, [firestore, user, selectedSession?.id]);

  const { data: sessionSignalData, isLoading: signalsLoading } = useCollection<NetworkSignal>(signalsQuery);
  
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newSessionName, setNewSessionName] = useState('');

  useEffect(() => {
    if (!selectedSession) {
      setIsEditingName(false);
      setAiSummary(null);
      return;
    };

    setNewSessionName(selectedSession.locationName ?? `Session ${selectedSession.id.slice(0, 6)}`);

  }, [selectedSession]);


  const exportToCSV = () => {
    if (!sessionSignalData || !selectedSession) return;
    const headers = ['ID,Latitude,Longitude,SignalStrength,Timestamp,Quality'];
    const rows = sessionSignalData.map(
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
    if (!sessionSignalData) return;
    setIsAiLoading(true);
    setAiSummary(null);
    try {
        const result = await summarizeSession({ signals: sessionSignalData });
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
  
  const handleSaveName = () => {
    if (!selectedSession || !newSessionName.trim() || !user || !firestore) {
        toast({ variant: 'destructive', title: 'Invalid Name', description: 'Session name cannot be empty.'});
        return;
    };
    
    updateDocumentNonBlocking(
      doc(firestore, 'users', user.uid, 'sessions', selectedSession.id),
      { locationName: newSessionName }
    );
    
    setIsEditingName(false);
    toast({ title: 'Session Renamed', description: `Session name updated to "${newSessionName}".`});
  }

  const tableData = useMemo(() => {
    if (!sessionSignalData) return [];
    const sortedData = [...sessionSignalData].sort((a, b) => {
        const timeA = a.timestamp?.seconds ? (a.timestamp.seconds * 1000 + a.timestamp.nanoseconds / 1000000) : 0;
        const timeB = b.timestamp?.seconds ? (b.timestamp.seconds * 1000 + b.timestamp.nanoseconds / 1000000) : 0;
        return timeB - timeA;
    });
    return sortedData;
  }, [sessionSignalData]);


  return (
    <div className="flex h-screen flex-col">
      <header className="flex h-16 shrink-0 items-center justify-between border-b bg-background px-4 md:px-6">
        <div className="flex items-center gap-2 truncate">
            <Button variant="outline" size="icon" onClick={() => setSelectedSession(null)} className="h-8 w-8">
              <Home />
              <span className="sr-only">Dashboard</span>
            </Button>
            {isEditingName && selectedSession ? (
                 <div className="flex items-center gap-2">
                    <Input 
                        value={newSessionName}
                        onChange={(e) => setNewSessionName(e.target.value)}
                        className="h-9 text-lg font-bold sm:text-xl md:text-2xl"
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                        autoFocus
                    />
                    <Button onClick={handleSaveName} size="icon" className="h-9 w-9"><Save /></Button>
                 </div>
            ) : (
                <h2 className="truncate text-lg font-bold tracking-tight sm:text-xl md:text-2xl">
                {selectedSession
                    ? selectedSession.locationName ?? `Session ${selectedSession.id.slice(0,6)}...`
                    : 'Select a Session'}
                </h2>
            )}
             {selectedSession && !isEditingName && (
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsEditingName(true)}>
                    <Edit />
                </Button>
            )}
        </div>
        <div className="flex items-center gap-2">
            <Button
                onClick={handleAiSummary}
                disabled={!sessionSignalData || sessionSignalData.length === 0 || isAiLoading}
                size="sm"
                variant="outline"
            >
                {isAiLoading ? <Loader2 className="mr-2 animate-spin" /> : <Bot className="mr-2" />}
                <span className="hidden sm:inline">AI Summary</span>
            </Button>
          <Button
            onClick={exportToCSV}
            disabled={!sessionSignalData || sessionSignalData.length === 0}
            size="sm"
          >
            <DownloadIcon className="mr-2" />
            <span className="hidden sm:inline">Export CSV</span>
          </Button>
        </div>
      </header>
      <main className="flex-1 overflow-auto p-2 sm:p-4 md:p-6">
        {isCollecting && selectedSession && <LiveCollectionPanel />}

        {!selectedSession && (
          <Card>
            <CardHeader>
              <CardTitle>Welcome to Zone.io</CardTitle>
              <CardDescription>
                Select or create a session from the sidebar to visualize signal strength.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                Click "Start New Session" on the dashboard to begin a live collection session.
              </p>
            </CardContent>
          </Card>
        )}
        
        {signalsLoading && !isCollecting && (
            <Card>
                <CardContent className="p-6">
                    <p className="text-center text-muted-foreground">Loading signal data...</p>
                </CardContent>
            </Card>
        )}

        {selectedSession && !signalsLoading && (
            <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                <div className="h-[40vh] lg:h-auto">
                    <MapView data={sessionSignalData ?? []} />
                </div>
                <div className="flex flex-col gap-4">
                    <SessionStats data={sessionSignalData ?? []} />
                    { isAiLoading && <Card><CardContent className="p-6"><p className="text-center text-muted-foreground">Generating AI summary...</p></CardContent></Card> }
                    { aiSummary && <Card><CardHeader><CardTitle>AI Summary</CardTitle></CardHeader><CardContent><div className="prose prose-sm dark:prose-invert" dangerouslySetInnerHTML={{ __html: aiSummary.replace(/<p>|<\/p>/g, '') }} /></CardContent></Card>}
                </div>
            </div>
            <SignalChart data={sessionSignalData ?? []} />
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
                            const timestamp = d.timestamp?.seconds ? new Date(d.timestamp.seconds * 1000) : new Date();
                            return (
                                <TableRow key={d.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleRowClick(d)}>
                                <TableCell>
                                    {timestamp.toLocaleString()}
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
                     <p className={cn(isCollecting ? "text-muted-foreground" : "")}>
                        {isCollecting ? "Waiting for the first data point..." : "No signal data for this session."}
                    </p>
                  )}
                </CardContent>
              </Card>
          </>
        )}
      </main>
    </div>
  );
}
