'use client';

import { SidebarGroup, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from './ui/sidebar';
import { MapPin, Dot, PlusCircle } from 'lucide-react';
import { useSelectedSession } from '@/hooks/use-selected-session';
import type { Session } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { useFirebase, useFirestore, useCollection } from '@/firebase';
import { collection, query, orderBy, doc, serverTimestamp, writeBatch, updateDoc } from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/provider';


export function SessionHistory() {
  const { user } = useFirebase();
  const firestore = useFirestore();
  const { selectedSession, setSelectedSession, isCollecting, setIsCollecting } = useSelectedSession();

  const sessionsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, 'users', user.uid, 'sessions'), orderBy('startTime', 'desc'));
  }, [user, firestore]);

  const { data: sessions, isLoading: sessionsLoading } = useCollection<Session>(sessionsQuery);

  const handleNewSession = async () => {
    if (isCollecting || !user || !firestore) return;
    
    setIsCollecting(true);
    
    const sessionCount = (sessions?.length ?? 0) + 1;
    const newSessionRef = doc(collection(firestore, 'users', user.uid, 'sessions'));
    const newSession: Session = {
        id: newSessionRef.id,
        userId: user.uid,
        startTime: Date.now(),
        endTime: null, // Active session
        locationName: `New Session ${sessionCount}`,
    };

    setSelectedSession(newSession);

    // Use a batch to write the session and initial signals
    const batch = writeBatch(firestore);

    batch.set(newSessionRef, newSession);

    // Simulate collecting a few points instantly around San Francisco
    const numPoints = Math.floor(Math.random() * 6) + 10;
    const startPos = { latitude: 37.7749, longitude: -122.4194 }; // San Francisco

    for (let i = 0; i < numPoints; i++) {
        const signalRef = doc(collection(firestore, 'users', user.uid, 'sessions', newSession.id, 'signals'));
        const newSignal = {
            id: signalRef.id,
            latitude: startPos.latitude + (Math.random() - 0.5) * 0.01,
            longitude: startPos.longitude + (Math.random() - 0.5) * 0.01,
            signalStrength: Math.floor(Math.random() * (-40 - -110 + 1) + -110),
            timestamp: serverTimestamp(),
        };
        batch.set(signalRef, newSignal);
    }
    
    // Commit the batch
    await batch.commit();

    // Simulate a 30-second collection period
    setTimeout(async () => {
        // Mark the session as complete in Firestore
        const sessionDocRef = doc(firestore, 'users', user.uid, 'sessions', newSession.id);
        await updateDoc(sessionDocRef, { endTime: Date.now() });

        setIsCollecting(false);
    }, 30000); // 30 seconds
  };
  

  if (sessionsLoading) {
    return (
        <SidebarGroup>
            <p className="p-2 text-sm text-muted-foreground">Loading sessions...</p>
        </SidebarGroup>
    )
  }

  return (
    <SidebarGroup>
        <div className="p-2 flex flex-col gap-2">
            <Button onClick={handleNewSession} className="w-full" disabled={isCollecting}>
                <PlusCircle className="mr-2" />
                {isCollecting ? 'Collecting...' : 'Start New Session'}
            </Button>
        </div>
      {(!sessions || sessions.length === 0) && !isCollecting && (
         <p className="p-2 text-sm text-muted-foreground">
          No sessions found. Start a new session to begin.
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
