'use client';

import { FirebaseClientProvider, useFirebase } from '@/firebase';
import { ZoneExplorerClient } from '@/components/zone-explorer-client';
import { AuthScreen } from '@/components/auth-screen';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarTrigger
} from '@/components/ui/sidebar';
import { SignalIcon } from 'lucide-react';
import { UserNav } from '@/components/user-nav';
import { SessionHistory } from '@/components/session-history';


function AppContent() {
  const { user, isUserLoading } = useFirebase();


  if (isUserLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <SignalIcon className="size-12 animate-pulse text-primary" />
          <p className="text-lg font-semibold text-muted-foreground">
            Loading Zone.io...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }


  return (
    <>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SignalIcon className="size-8 text-primary" />
              <h1 className="text-xl font-semibold font-headline">
                Zone.io
              </h1>
            </div>
            <UserNav />
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SessionHistory />
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <div className="flex items-center gap-2 border-b p-2 md:hidden">
            <SidebarTrigger/>
            <h1 className="text-lg font-semibold">Sessions</h1>
        </div>
        <ZoneExplorerClient />
      </SidebarInset>
    </>
  );
}

export default function Home() {
  return (
    <FirebaseClientProvider>
      <AppContent />
    </FirebaseClientProvider>
  );
}

    