'use client';

import { useMemo } from 'react';
import { SidebarGroup, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from './ui/sidebar';
import { MapPin, Dot } from 'lucide-react';
import { useSelectedSession } from '@/hooks/use-selected-session';
import { mockSessions, mockNetworkSignals } from '@/lib/mock-data';
import type { Session } from '@/lib/types';
import { cn } from '@/lib/utils';

export function SessionHistory() {
  const { selectedSession, setSelectedSession } = useSelectedSession();

  const sessions: Session[] = useMemo(() => mockSessions, []);
  const signalsBySession = useMemo(() => {
    return mockNetworkSignals.reduce((acc, signal) => {
        if (!acc[signal.sessionId]) {
            acc[signal.sessionId] = 0;
        }
        acc[signal.sessionId]++;
        return acc;
    }, {} as Record<string, number>)
  }, []);

  if (!sessions || sessions.length === 0) {
    return (
      <SidebarGroup>
        <p className="p-2 text-sm text-muted-foreground">
          No sessions found. Start a mapping session on your mobile app to see
          it here.
        </p>
      </SidebarGroup>
    );
  }

  return (
    <SidebarGroup>
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
