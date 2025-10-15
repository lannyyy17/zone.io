'use client';

import dynamic from 'next/dynamic';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { DownloadIcon, PlusIcon, MinusIcon } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
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
import { mockNetworkSignals } from '@/lib/mock-data';

const MapView = dynamic(() => import('@/components/map-view'), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-muted" />,
});

const DEFAULT_CENTER: [number, number] = [34.0522, -118.2437];
const DEFAULT_ZOOM = 10;

export function ZoneExplorerClient() {
  const { selectedSession } = useSelectedSession();
  const [center, setCenter] = useState<[number, number]>(DEFAULT_CENTER);
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const [activeTab, setActiveTab] = useState('map');

  const signalData: NetworkSignal[] = useMemo(() => {
    if (!selectedSession) return [];
    return mockNetworkSignals.filter(
      (signal) => signal.sessionId === selectedSession.id
    );
  }, [selectedSession]);

  useEffect(() => {
    if (signalData && signalData.length > 0) {
      const latitudes = signalData.map(s => s.latitude);
      const longitudes = signalData.map(s => s.longitude);
      const avgLat = latitudes.reduce((a, b) => a + b, 0) / latitudes.length;
      const avgLon = longitudes.reduce((a, b) => a + b, 0) / longitudes.length;
      setCenter([avgLat, avgLon]);
      setZoom(13);
    } else {
        setCenter(DEFAULT_CENTER);
        setZoom(DEFAULT_ZOOM);
    }
  }, [signalData]);


  const exportToCSV = () => {
    if (!signalData || !selectedSession) return;
    const headers = ['ID,Latitude,Longitude,SignalStrength,Timestamp'];
    const rows = signalData.map(
      (d) =>
        `${d.id},${d.latitude},${d.longitude},${d.signalStrength},${new Date(
          d.timestamp
        ).toISOString()}`
    );
    const csvContent =
      'data:text/csv;charset=utf-8,' + headers.concat(rows).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `session_${selectedSession?.id}_signals.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
            : 'Dashboard'}
        </h2>
        <div className="flex items-center gap-2">
          <Button
            onClick={exportToCSV}
            disabled={!signalData || signalData.length === 0}
            size="sm"
          >
            <DownloadIcon className="mr-2" />
            <span className="hidden sm:inline">Export Data</span>
          </Button>
        </div>
      </header>
      <main className="flex-1 overflow-auto p-2 sm:p-4 md:p-6">
        {!selectedSession && (
          <Card>
            <CardHeader>
              <CardTitle>Welcome to Zone Explorer</CardTitle>
              <CardDescription>
                Select a session from the sidebar to view the signal heatmap.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                Once you have collected data with the mobile app, your sessions
                will appear in the sidebar on the left. Click on a session to
                load the data and visualize it on the map.
              </p>
            </CardContent>
          </Card>
        )}
        {selectedSession && (
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex h-full flex-col"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="map">Map View</TabsTrigger>
              <TabsTrigger value="data">Raw Data</TabsTrigger>
            </TabsList>
            <TabsContent value="map" className="flex-1">
              <Card className="h-full">
                <CardContent className="h-full p-0">
                  <div className="relative h-full min-h-[300px] w-full overflow-hidden rounded-lg">
                    <MapView
                      center={center}
                      zoom={zoom}
                    />
                    <div className="absolute bottom-4 right-4 z-[1000] flex flex-col gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        className="bg-background"
                        onClick={() => setZoom((z) => Math.min(z + 1, 18))}
                      >
                        <PlusIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        className="bg-background"
                        onClick={() => setZoom((z) => Math.max(z - 1, 1))}
                      >
                        <MinusIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="data" className="flex-1 overflow-y-auto">
              <Card>
                <CardHeader>
                  <CardTitle>Raw Signal Data</CardTitle>
                  <CardDescription>
                    Real-time feed of collected signal data points for the
                    selected session.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {tableData && tableData.length > 0 ? (
                    <div className="max-h-[60vh] overflow-auto rounded-lg border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Timestamp</TableHead>
                            <TableHead>Signal</TableHead>
                            <TableHead>Latitude</TableHead>
                            <TableHead>Longitude</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {tableData.map((d) => (
                            <TableRow key={d.id}>
                              <TableCell>
                                {new Date(d.timestamp).toLocaleString()}
                              </TableCell>
                              <TableCell>{d.signalStrength} dBm</TableCell>
                              <TableCell>{d.latitude.toFixed(6)}</TableCell>
                              <TableCell>{d.longitude.toFixed(6)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                     <p>No signal data for this session.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
}
