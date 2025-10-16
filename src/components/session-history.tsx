'use client';

import { useMemo } from 'react';
import { SidebarGroup, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from './ui/sidebar';
import { MapPin, Dot, PlusCircle, TestTube2 } from 'lucide-react';
import { useSelectedSession } from '@/hooks/use-selected-session';
import type { Session, NetworkSignal } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';

// Helper to generate mock data on the client side.
const generateClientSideMocks = () => {
    const sessions: Session[] = [
      {
        id: 'session-1',
        userId: 'user-1',
        startTime: new Date('2024-07-20T10:00:00Z').getTime(),
        endTime: new Date('2024-07-20T10:30:00Z').getTime(),
        locationName: 'Downtown Office',
      },
      {
        id: 'session-2',
        userId: 'user-1',
        startTime: new Date('2024-07-21T14:00:00Z').getTime(),
        endTime: new Date('2024-07-21T14:45:00Z').getTime(),
        locationName: 'Home Network Scan',
      },
      {
        id: 'session-3',
        userId: 'user-1',
        startTime: new Date('2024-07-22T09:15:00Z').getTime(),
        endTime: null, // Active session
        locationName: 'University Library',
      },
    ];

    const signals: NetworkSignal[] = [
      // Data for Downtown Office (session-1)
      { id: 'sig-1', sessionId: 'session-1', latitude: 34.0522, longitude: -118.2437, signalStrength: -55, timestamp: new Date('2024-07-20T10:01:00Z').getTime() },
      { id: 'sig-2', sessionId: 'session-1', latitude: 34.0525, longitude: -118.2440, signalStrength: -85, timestamp: new Date('2024-07-20T10:05:00Z').getTime() },
      { id: 'sig-3', sessionId: 'session-1', latitude: 34.0530, longitude: -118.2445, signalStrength: -45, timestamp: new Date('2024-07-20T10:10:00Z').getTime() },
      { id: 'sig-4', sessionId: 'session-1', latitude: 34.0528, longitude: -118.2430, signalStrength: -65, timestamp: new Date('2024-07-20T10:15:00Z').getTime() },

      // Data for Home Network Scan (session-2)
      { id: 'sig-5', sessionId: 'session-2', latitude: 34.0600, longitude: -118.2500, signalStrength: -42, timestamp: new Date('2024-07-21T14:02:00Z').getTime() },
      { id: 'sig-6', sessionId: 'session-2', latitude: 34.0605, longitude: -118.2505, signalStrength: -78, timestamp: new Date('2024-07-21T14:10:00Z').getTime() },
      { id: 'sig-7', sessionId: 'session-2', latitude: 34.0610, longitude: -118.2510, signalStrength: -90, timestamp: new Date('2024-07-21T14:20:00Z').getTime() },
      { id: 'sig-8', sessionId: 'session-2', latitude: 34.0595, longitude: -118.2495, signalStrength: -50, timestamp: new Date('2024-07-21T14:30:00Z').getTime() },
      
      // Data for University Library (session-3)
      { id: 'sig-9', sessionId: 'session-3', latitude: 34.0224, longitude: -118.2851, signalStrength: -60, timestamp: new Date('2024-07-22T09:16:00Z').getTime() },
      { id: 'sig-10', sessionId: 'session-3', latitude: 34.0220, longitude: -118.2855, signalStrength: -75, timestamp: new Date('2024-07-22T09:20:00Z').getTime() },
    ];

    return { sessions, signals };
}

export function SessionHistory() {
  const { selectedSession, setSelectedSession, sessions, setSessions, isCollecting, setIsCollecting, setSignalData, signalData } = useSelectedSession();

  const signalsBySession = useMemo(() => {
    return signalData.reduce((acc, signal) => {
        if (!acc[signal.sessionId]) {
            acc[signal.sessionId] = 0;
        }
        acc[signal.sessionId]++;
        return acc;
    }, {} as Record<string, number>)
  }, [signalData]);
  
  const handleNewSession = () => {
    if (isCollecting) return;
    
    setIsCollecting(true);
    
    const sessionCount = sessions.length + 1;
    const newSession: Session = {
        id: `session-${Date.now()}`,
        userId: 'user-1',
        startTime: Date.now(),
        endTime: null, // Active session
        locationName: `New Session ${sessionCount}`,
    };

    // Buffer for new signals
    const newSignals: NetworkSignal[] = [];
    const numPoints = Math.floor(Math.random() * 6) + 10;
    const lastSignalPos = signalData[signalData.length - 1] ?? { latitude: 34.0, longitude: -118.0 };

    for (let i = 0; i < numPoints; i++) {
        const newSignal: NetworkSignal = {
            id: `sig-${Math.random().toString(36).substr(2, 9)}`,
            sessionId: newSession.id,
            latitude: lastSignalPos.latitude + (Math.random() - 0.5) * 0.001,
            longitude: lastSignalPos.longitude + (Math.random() - 0.5) * 0.001,
            signalStrength: Math.floor(Math.random() * (-40 - -110 + 1) + -110),
            timestamp: newSession.startTime + (i * (30000 / numPoints)), // spread over 30s
        };
        newSignals.push(newSignal);
    }
    
    const allSessions = [newSession, ...sessions];

    setSessions(allSessions);
    setSelectedSession(newSession);

    // Simulate a 30-second collection period
    setTimeout(() => {
        // Add all collected signals at once
        setSignalData(prevSignals => [...prevSignals, ...newSignals]);

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
  
  const handleLoadDemoData = () => {
    const { sessions: demoSessions, signals: demoSignals } = generateClientSideMocks();
    setSessions(demoSessions);
    setSignalData(demoSignals);
  }

  if (sessions.length === 0) {
    return (
      <SidebarGroup>
        <div className='p-2 flex flex-col gap-2'>
            <Button onClick={handleNewSession} className="w-full" disabled={isCollecting}>
                <PlusCircle className="mr-2" />
                {isCollecting ? 'Collecting...' : 'Start New Session'}
            </Button>
             <Button onClick={handleLoadDemoData} className="w-full" variant="outline">
                <TestTube2 className="mr-2" />
                Load Demo Data
            </Button>
        </div>
        <p className="p-2 text-sm text-muted-foreground">
          No sessions found. Start a new session or load demo data.
        </p>
      </SidebarGroup>
    );
  }

  return (
    <SidebarGroup>
        <div className="p-2 flex flex-col gap-2">
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
