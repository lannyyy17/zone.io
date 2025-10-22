'use client';

import { FirebaseClientProvider, useFirebase } from '@/firebase';
import { ZoneExplorerClient } from '@/components/zone-explorer-client';
import { AuthScreen } from '@/components/auth-screen';
import { SignalIcon } from 'lucide-react';
import { UserNav } from '@/components/user-nav';
import { useSelectedSession } from '@/hooks/use-selected-session';
import { Dashboard } from '@/components/dashboard';


function AppContent() {
  const { user, isUserLoading } = useFirebase();
  const { selectedSession } = useSelectedSession();


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
    <div className="flex h-screen w-full flex-col">
      <header className="flex h-16 shrink-0 items-center justify-between border-b bg-background px-4 md:px-6">
          <div className="flex items-center gap-2">
            <SignalIcon className="size-8 text-primary" />
            <h1 className="text-xl font-semibold font-headline">
              Zone.io
            </h1>
          </div>
          <UserNav />
      </header>
      <div className="flex-1 overflow-auto">
        { selectedSession ? <ZoneExplorerClient /> : <Dashboard /> }
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <FirebaseClientProvider>
      <AppContent />
    </FirebaseClientProvider>
  );
}
