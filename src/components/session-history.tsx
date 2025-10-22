'use client';

import { SidebarGroup, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from './ui/sidebar';
import { MapPin, Dot } from 'lucide-react';
import { useSelectedSession } from '@/hooks/use-selected-session';
import type { Session } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useFirebase, useFirestore, useCollection } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/provider';


export function SessionHistory() {
  const { user } = useFirebase();
  const firestore = useFirestore();
  const { selectedSession, setSelectedSession, isCollecting } = useSelectedSession();

  const sessionsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, 'users', user.uid, 'sessions'), orderBy('startTime', 'desc'));
  }, [user, firestore]);

  const { data: sessions, isLoading: sessionsLoading } = useCollection<Session>(sessionsQuery);

  if (sessionsLoading) {
    return (
        <SidebarGroup>
            <p className="p-2 text-sm text-muted-foreground">Loading sessions...</p>
        </SidebarGroup>
    )
  }

  return (
    <SidebarGroup>
      {(!sessions || sessions.length === 0) && !isCollecting && (
         <p className="p-2 text-sm text-muted-foreground">
          No sessions found. Start a new session from the dashboard to begin.
        </p>
      )}
      <SidebarMenu>
        {sessions && sessions.map((session) => {
          const isActive = session.endTime === null;
          const isCurrentCollectingSession = isActive && isCollecting && selectedSession?.id === session.id;

          return (
            <SidebarMenuItem key={session.id}>
              <SidebarMenuButton
                isActive={selectedSession?.id === session.id}
                onClick={() => {
                    if (!isCollecting) {
                        setSelectedSession(session)
                    }
                }}
                disabled={isCollecting && !isCurrentCollectingSession}
              >
                <MapPin />
                <div className="flex flex-col items-start truncate">
                  <span className="font-medium truncate">
                    {session.locationName ?? `Session ${session.id.slice(0, 6)}`}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <div className="flex items-center">
                        <Dot className={cn("mr-1 h-4 w-4", isActive ? "animate-pulse text-blue-500" : "text-green-500")} />
                        <span>{isCurrentCollectingSession ? "Collecting" : (isActive ? "Active" : "Completed")}</span>
                    </div>
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
