'use client';

import { Button } from './ui/button';
import { PlusCircle } from 'lucide-react';
import { useSelectedSession } from '@/hooks/use-selected-session';
import { useFirebase, useFirestore } from '@/firebase';
import { collection, doc, serverTimestamp, writeBatch, updateDoc, query, orderBy } from 'firebase/firestore';
import { useCollection } from '@/firebase';
import type { Session } from '@/lib/types';
import { DownloadTimeCalculator } from './download-time-calculator';
import { PingMonitor } from './ping-monitor';
import { useMemoFirebase } from '@/firebase/provider';

export function Dashboard() {
  const { user } = useFirebase();
  const firestore = useFirestore();
  const { isCollecting, setIsCollecting, setSelectedSession } = useSelectedSession();

  const sessionsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, 'users', user.uid, 'sessions'), orderBy('startTime', 'desc'));
  }, [user, firestore]);

  const { data: sessions } = useCollection<Session>(sessionsQuery);

  const handleNewSession = async () => {
    if (isCollecting || !user || !firestore) return;

    setIsCollecting(true);

    const sessionCount = (sessions?.length ?? 0) + 1;
    const newSessionRef = doc(collection(firestore, 'users', user.uid, 'sessions'));
    const newSession: Session = {
      id: newSessionRef.id,
      userId: user.uid,
      startTime: Date.now(),
      endTime: null,
      locationName: `New Session ${sessionCount}`,
    };

    setSelectedSession(newSession);

    const batch = writeBatch(firestore);
    batch.set(newSessionRef, newSession);

    const numPoints = Math.floor(Math.random() * 6) + 10;
    const startPos = { latitude: 37.7749, longitude: -122.4194 };

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
    
    await batch.commit();

    setTimeout(async () => {
      const sessionDocRef = doc(firestore, 'users', user.uid, 'sessions', newSession.id);
      await updateDoc(sessionDocRef, { endTime: Date.now() });
      setIsCollecting(false);
    }, 30000);
  };

  return (
    <div className="flex h-full flex-col">
      <header className="flex h-16 shrink-0 items-center justify-between border-b bg-background px-4 md:px-6">
        <h2 className="text-lg font-bold tracking-tight sm:text-xl md:text-2xl">
          Dashboard
        </h2>
      </header>
      <main className="flex-1 overflow-auto p-2 sm:p-4 md:p-6">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="lg:col-span-2">
                 <Button onClick={handleNewSession} className="w-full h-24 text-xl" disabled={isCollecting}>
                    <PlusCircle className="mr-2 size-8" />
                    {isCollecting ? 'Collecting Data...' : 'Start New Session'}
                </Button>
            </div>
            <DownloadTimeCalculator />
            <PingMonitor />
        </div>
      </main>
    </div>
  );
}
