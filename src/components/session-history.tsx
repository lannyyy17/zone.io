'use client';

import { useMemo } from 'react';
import { SidebarGroup, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from './ui/sidebar';
import { MapPin, Dot, PlusCircle } from 'lucide-react';
import { useSelectedSession } from '@/hooks/use-selected-session';
import { mockNetworkSignals, createMockSession } from '@/lib/mock-data';
import type { Session } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';

export function SessionHistory() {
  const { selectedSession, setSelectedSession, sessions, setSessions } = useSelectedSession();

  const signalsBySession = useMemo(() => {
    return mockNetworkSignals.reduce((acc, signal) => {
        if (!acc[signal.sessionId]) {
            acc[signal.sessionId] = 0;
        }
        acc[signal.sessionId]++;
        return acc;
    }, {} as Record<string, number>)
  }, []);

  const handleNewSession = () => {
    const { newSession, allSessions } = createMockSession();
    setSessions(allSessions);
    setSelectedSession(newSession);
  };

  if (!sessions || sessions.length === 0) {
    return (
      <SidebarGroup>
        <div className='p-2'>
            <Button onClick={handleNewSession} className="w-full">
                <PlusCircle className="mr-2" />
                Start New Session
            </Button>
        </div>
        <p className="p-2 text-sm text-muted-foreground">
          No sessions found. Start a mapping session to see it here.
        </p>
      </SidebarGroup>
    );
  }

  return (
    <SidebarGroup>
        <div className="p-2">
            <Button onClick={handleNewSession} className="w-full">
                <PlusCircle className="mr-2" />
                Start New Session
            </Button>
        </div>
      <SidebarMenu>
        {sessions.map((session) => {
          const isActive = session.endTime === null;
          return (
            <SidebarMenuItem key={session.id}>
              <SidebarMenuButton
                isActive={selectedSession?.id === session.id}
                onClick={() => setSelectedSession(session)}
              >
                <MapPin />
                <div className="flex flex-col items-start truncate">
                  <span className="font-medium truncate">
                    {session.locationName ?? `Session ${session.id.slice(0, 6)}`}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <div className="flex items-center">
                        <Dot className={cn("mr-1 h-4 w-4", isActive ? "animate-pulse text-blue-500" : "text-green-500")} />
                        <span>{isActive ? "Active" : "Completed"}</span>
                    </div>
                    <span>&middot;</span>
                    <span>{signalsBySession[session.id] ?? 0} points</span>
                  </div>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
