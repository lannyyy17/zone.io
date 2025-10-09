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
import { DownloadIcon, PlusIcon, FilterIcon, MinusIcon } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { RawDataTable, type SignalData } from '@/components/raw-data-table';
import { useState } from 'react';

const MapView = dynamic(() => import('@/components/map-view'), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-muted" />,
});

// A default location (e.g., Los Angeles)
const DEFAULT_CENTER: [number, number] = [34.0522, -118.2437];
const DEFAULT_ZOOM = 13;

const MOCK_DATA: SignalData[] = [
  {
    id: '1',
    timestamp: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
    carrier: 'Verizon',
    rssi: -85,
    latitude: 34.0522,
    longitude: -118.2437,
  },
  {
    id: '2',
    timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    carrier: 'AT&T',
    rssi: -92,
    latitude: 34.053,
    longitude: -118.244,
  },
  {
    id: '3',
    timestamp: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
    carrier: 'T-Mobile',
    rssi: -78,
    latitude: 34.054,
    longitude: -118.245,
  },
  {
    id: '4',
    timestamp: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
    carrier: 'Verizon',
    rssi: -88,
    latitude: 34.055,
    longitude: -118.246,
  },
  {
    id: '5',
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    carrier: 'AT&T',
    rssi: -95,
    latitude: 34.056,
    longitude: -118.247,
  },
];

type Carrier = 'AT&T' | 'Verizon' | 'T-Mobile';
const ALL_CARRIERS: Carrier[] = ['AT&T', 'Verizon', 'T-Mobile'];

export function ZoneExplorerClient() {
  const [center, setCenter] = useState<[number, number]>(DEFAULT_CENTER);
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const [activeTab, setActiveTab] = useState('map');
  const [selectedCarriers, setSelectedCarriers] = useState<Set<Carrier>>(
    new Set(ALL_CARRIERS)
  );

  const handleCarrierToggle = (carrier: Carrier) => {
    setSelectedCarriers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(carrier)) {
        newSet.delete(carrier);
      } else {
        newSet.add(carrier);
      }
      return newSet;
    });
  };

  const handleRowClick = (data: SignalData) => {
    setCenter([data.latitude, data.longitude]);
    setZoom(15);
    setActiveTab('map');
  };
  
  const exportToCSV = () => {
    const headers = ['ID,Timestamp,Carrier,RSSI,Latitude,Longitude'];
    const rows = filteredData.map(d => 
        `${d.id},${d.timestamp},${d.carrier},${d.rssi},${d.latitude},${d.longitude}`
    );
    const csvContent = "data:text/csv;charset=utf-8," + headers.concat(rows).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "signal_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredData = MOCK_DATA.filter((d) =>
    selectedCarriers.has(d.carrier)
  );

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
              {ALL_CARRIERS.map((carrier) => (
                <DropdownMenuCheckboxItem
                  key={carrier}
                  checked={selectedCarriers.has(carrier)}
                  onCheckedChange={() => handleCarrierToggle(carrier)}
                >
                  {carrier}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={exportToCSV}>
            <DownloadIcon className="mr-2" />
            Export Data
          </Button>
        </div>
      </header>
      <main className="flex-1 overflow-auto p-4 md:p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="map">Map View</TabsTrigger>
            <TabsTrigger value="data">Raw Data</TabsTrigger>
          </TabsList>
          <TabsContent value="map" className="h-full">
            <Card className="h-[calc(100%-40px)]">
              <CardContent className="h-full p-0">
                <div className="relative h-full w-full overflow-hidden rounded-lg">
                  <MapView center={center} zoom={zoom} data={filteredData} />
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
          <TabsContent value="data">
            <Card>
              <CardHeader>
                <CardTitle>Raw Signal Data</CardTitle>
                <CardDescription>
                  Real-time feed of collected signal data points. Click a row to
                  view on map.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RawDataTable data={filteredData} onRowClick={handleRowClick} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
