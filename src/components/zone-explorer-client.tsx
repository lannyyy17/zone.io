'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DownloadIcon, Wifi, TrendingUp, TrendingDown, Hash } from 'lucide-react';
import { useMemo } from 'react';
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
import { Badge } from './ui/badge';


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

export function ZoneExplorerClient() {
  const { selectedSession } = useSelectedSession();

  const signalData: NetworkSignal[] = useMemo(() => {
    if (!selectedSession) return [];
    return mockNetworkSignals.filter(
      (signal) => signal.sessionId === selectedSession.id
    );
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
            <div className="h-96 w-full animate-pulse bg-muted rounded-lg mb-4">
                <div className="flex items-center justify-center h-full text-muted-foreground">Map view is currently disabled.</div>
            </div>
              <Card>
                <CardHeader>
                  <CardTitle>Raw Signal Data</CardTitle>
                  <CardDescription>
                    Real-time feed of collected signal data points for the selected session.
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
                                <TableRow key={d.id} className="cursor-pointer">
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
