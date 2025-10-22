'use client';

import { Button } from './ui/button';
import { PlusCircle, StopCircle } from 'lucide-react';
import { useSelectedSession } from '@/hooks/use-selected-session';
import { useFirebase, useFirestore } from '@/firebase';
import { collection, doc, serverTimestamp, writeBatch, updateDoc, setDoc } from 'firebase/firestore';
import type { Session } from '@/lib/types';
import { DownloadTimeCalculator } from './download-time-calculator';
import { PingMonitor } from './ping-monitor';

export function Dashboard() {
  const { user } = useFirebase();
  const firestore = useFirestore();
  const { isCollecting, setIsCollecting, setSelectedSession, setActiveSession, activeSession } = useSelectedSession();

  const handleNewSession = async () => {
    if (!user || !firestore) return;

    setIsCollecting(true);

    const newSessionRef = doc(collection(firestore, 'users', user.uid, 'sessions'));
    const newSession: Session = {
      id: newSessionRef.id,
      userId: user.uid,
      startTime: Date.now(),
      endTime: null,
      locationName: `Session - ${new Date().toLocaleString()}`,
    };

    await setDoc(newSessionRef, newSession);
    setActiveSession(newSession); // Set this as the live session
    setSelectedSession(newSession);
  };

  const handleStopSession = async () => {
    if (!user || !firestore || !activeSession) return;

    const sessionDocRef = doc(firestore, 'users', user.uid, 'sessions', activeSession.id);
    await updateDoc(sessionDocRef, { endTime: Date.now() });

    setIsCollecting(false);
    setActiveSession(null);
  }

  const StartStopButton = () => {
    if (isCollecting) {
        return (
            <Button onClick={handleStopSession} className="w-full h-24 text-xl" variant="destructive">
                <StopCircle className="mr-2 size-8" />
                Stop Session
            </Button>
        )
    }
    return (
        <Button onClick={handleNewSession} className="w-full h-24 text-xl">
            <PlusCircle className="mr-2 size-8" />
            Start New Session
        </Button>
    )
  }

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
                 <StartStopButton />
            </div>
            <DownloadTimeCalculator />
            <PingMonitor />
        </div>
      </main>
    </div>
  );
}
