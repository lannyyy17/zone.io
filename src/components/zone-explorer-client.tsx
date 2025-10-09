'use client';

import Image from 'next/image';
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

export function ZoneExplorerClient() {
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
                  <Image
                    src="https://picsum.photos/seed/zone-explorer/1200/800"
                    alt="Placeholder map"
                    fill
                    style={{ objectFit: 'cover' }}
                    data-ai-hint="map abstract"
                  />
                  <div className="absolute bottom-4 right-4 flex flex-col gap-2">
                    <Button size="icon" variant="outline" className="bg-background">
                      <PlusIcon className="h-4 w-4"/>
                    </Button>
                     <Button size="icon" variant="outline" className="bg-background">
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
                <p>Raw data table will be displayed here.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
