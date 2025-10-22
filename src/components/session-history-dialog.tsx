'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from './ui/button';
import { History, MapPin, Dot } from 'lucide-react';
import { useSelectedSession } from '@/hooks/use-selected-session';
import type { Session } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useFirebase, useFirestore, useCollection } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/provider';
import { useState } from 'react';

function SessionItem({ session, onSelect }: { session: Session, onSelect: () => void }) {
    const { selectedSession } = useSelectedSession();
    const isLive = session.endTime === null;

    return (
        <Button
            variant="ghost"
            className={cn(
                "w-full justify-start text-left h-auto",
                selectedSession?.id === session.id && "bg-muted"
            )}
            onClick={onSelect}
        >
            <MapPin className="mr-2" />
            <div className="flex flex-col items-start truncate">
                <span className="font-medium truncate">
                {session.locationName ?? `Session ${session.id.slice(0, 6)}`}
                </span>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <div className="flex items-center">
                    <Dot className={cn("mr-1 h-4 w-4", isLive ? "animate-pulse text-red-500" : "text-green-500")} />
                    <span>{isLive ? "Live" : "Completed"}</span>
                </div>
                </div>
            </div>
        </Button>
    )
}

export function SessionHistoryDialog() {
  const { user } = useFirebase();
  const firestore = useFirestore();
  const { setSelectedSession, isCollecting } = useSelectedSession();
  const [isOpen, setIsOpen] = useState(false);

  const sessionsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, 'users', user.uid, 'sessions'), orderBy('startTime', 'desc'));
  }, [user, firestore]);

  const { data: sessions, isLoading: sessionsLoading } = useCollection<Session>(sessionsQuery);

  const handleSessionSelect = (session: Session) => {
    setSelectedSession(session);
    setIsOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <History className="mr-2" />
          <span className="hidden sm:inline">Session History</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Session History</DialogTitle>
          <DialogDescription>
            Select a previous session to view its details.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto">
            {sessionsLoading && <p className="p-2 text-sm text-muted-foreground">Loading sessions...</p>}
            {(!sessions || sessions.length === 0) && !isCollecting && (
                <p className="p-2 text-sm text-muted-foreground">
                    No sessions found. Start a new session from the dashboard to begin.
                </p>
            )}
            <div className="flex flex-col gap-2">
                {sessions && sessions.map((session) => (
                    <SessionItem key={session.id} session={session} onSelect={() => handleSessionSelect(session)} />
                ))}
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
