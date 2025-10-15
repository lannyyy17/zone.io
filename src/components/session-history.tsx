'use client';

import { useMemo } from 'react';
import { SidebarGroup, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from './ui/sidebar';
import { MapPin, Dot, PlusCircle } from 'lucide-react';
import { useSelectedSession } from '@/hooks/use-selected-session';
import { mockNetworkSignals, createMockSession } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';

export function SessionHistory() {
  const { selectedSession, setSelectedSession, sessions, setSessions, isCollecting, setIsCollecting } = useSelectedSession();

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
    if (isCollecting) return;
    
    setIsCollecting(true);
    const { newSession, allSessions } = createMockSession();
    setSessions(allSessions);
    setSelectedSession(newSession);

    // Simulate a 30-second collection period
    setTimeout(() => {
        // Mark the session as complete
        const finalSessions = allSessions.map(s => 
            s.id === newSession.id ? { ...s, endTime: Date.now() } : s
        );
        setSessions(finalSessions);
        
        // Find the now-completed session to update the context
        const completedSession = finalSessions.find(s => s.id === newSession.id);
        if (completedSession) {
            setSelectedSession(completedSession);
        }
        
        setIsCollecting(false);
    }, 30000); // 30 seconds
  };

  if (!sessions || sessions.length === 0) {
    return (
      <SidebarGroup>
        <div className='p-2'>
            <Button onClick={handleNewSession} className="w-full" disabled={isCollecting}>
                <PlusCircle className="mr-2" />
                {isCollecting ? 'Collecting...' : 'Start New Session'}
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
            <Button onClick={handleNewSession} className="w-full" disabled={isCollecting}>
                <PlusCircle className="mr-2" />
                {isCollecting ? 'Collecting...' : 'Start New Session'}
            </Button>
        </div>
      <SidebarMenu>
        {sessions.map((session) => {
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
