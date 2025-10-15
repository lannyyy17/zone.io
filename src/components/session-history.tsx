'use client';

import { useMemo } from 'react';
import { SidebarGroup, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from './ui/sidebar';
import { MapPin, Clock } from 'lucide-react';
import { useSelectedSession } from '@/hooks/use-selected-session';
import { mockSessions } from '@/lib/mock-data';
import type { Session } from '@/lib/types';

export function SessionHistory() {
  const { selectedSession, setSelectedSession } = useSelectedSession();

  const sessions: Session[] = useMemo(() => mockSessions, []);

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
        {sessions.map((session) => (
          <SidebarMenuItem key={session.id}>
            <SidebarMenuButton
              isActive={selectedSession?.id === session.id}
              onClick={() => setSelectedSession(session)}
            >
              <MapPin />
              <div className="flex flex-col items-start">
                <span className="font-medium">
                  {session.locationName ?? `Session ${session.id.slice(0, 6)}`}
                </span>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="size-3" />
                  <span>
                    {new Date(session.startTime).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
