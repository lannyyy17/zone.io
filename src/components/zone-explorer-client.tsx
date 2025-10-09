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
import { DownloadIcon, PlusIcon, FilterIcon } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { RawDataTable } from '@/components/raw-data-table';
import { useEffect, useState } from 'react';

const MapView = dynamic(() => import('@/components/map-view'), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-muted" />,
});

// A default location (e.g., Los Angeles)
const DEFAULT_CENTER: [number, number] = [34.0522, -118.2437];
const DEFAULT_ZOOM = 13;

export function ZoneExplorerClient() {
  const [center, setCenter] = useState<[number, number]>(DEFAULT_CENTER);
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);

  return (
    <div className="flex h-full flex-col">
      <header className="flex h-16 items-center justify-between border-b bg-background px-4 md:px-6">
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center gap-2">
           <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <FilterIcon className="mr-2" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Filter by Carrier</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem checked>AT&T</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>Verizon</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>T-Mobile</DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button>
            <DownloadIcon className="mr-2" />
            Export Data
          </Button>
        </div>
      </header>
      <main className="flex-1 overflow-auto p-4 md:p-6">
        <Tabs defaultValue="map" className="h-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="map">Map View</TabsTrigger>
            <TabsTrigger value="data">Raw Data</TabsTrigger>
          </TabsList>
          <TabsContent value="map" className="h-full">
            <Card className="h-[calc(100%-40px)]">
              <CardContent className="h-full p-0">
                <div className="relative h-full w-full rounded-lg overflow-hidden">
                  <MapView center={center} zoom={zoom} />
                  <div className="absolute bottom-4 right-4 z-[1000] flex flex-col gap-2">
                    <Button size="icon" variant="outline" className="bg-background" onClick={() => setZoom(z => z + 1)}>
                      <PlusIcon className="h-4 w-4"/>
                    </Button>
                     <Button size="icon" variant="outline" className="bg-background" onClick={() => setZoom(z => z - 1)}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><line x1="5" x2="19" y1="12" y2="12"/></svg>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="data">
            <Card>
              <CardHeader>
                <CardTitle>Raw Signal Data</CardTitle>
                <CardDescription>
                  Real-time feed of collected signal data points.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RawDataTable />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
