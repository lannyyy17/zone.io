'use client';

import { useState } from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
} from '@/components/ui/sidebar';
import { ZoneExplorerClient } from '@/components/zone-explorer-client';
import { HomeIcon, WifiIcon, History, BarChart2, SettingsIcon, SignalIcon } from 'lucide-react';

export default function Home() {
  const [activeMenu, setActiveMenu] = useState('Dashboard');

  return (
    <>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <SignalIcon className="size-8 text-primary" />
            <h1 className="text-xl font-semibold font-headline">
              Zone Explorer
            </h1>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={() => setActiveMenu('Dashboard')} isActive={activeMenu === 'Dashboard'}>
                <HomeIcon />
                Dashboard
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={() => setActiveMenu('Live View')} isActive={activeMenu === 'Live View'}>
                <WifiIcon />
                Live View
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={() => setActiveMenu('History')} isActive={activeMenu === 'History'}>
                <History />
                History
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={() => setActiveMenu('Reports')} isActive={activeMenu === 'Reports'}>
                <BarChart2 />
                Reports
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={() => setActiveMenu('Settings')} isActive={activeMenu === 'Settings'}>
                <SettingsIcon />
                Settings
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <ZoneExplorerClient />
      </SidebarInset>
    </>
  );
}
