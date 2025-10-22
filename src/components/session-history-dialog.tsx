'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from './ui/button';
import { History, MapPin, Dot, Trash2, StopCircle } from 'lucide-react';
import { useSelectedSession } from '@/hooks/use-selected-session';
import type { Session } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useFirebase, useFirestore, useCollection, updateDocumentNonBlocking } from '@/firebase';
import { collection, query, orderBy, doc } from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/provider';
import { useState } from 'react';
import { deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { toast } from '@/hooks/use-toast';

function SessionItem({ session, onSelect, onDelete, onStop }: { session: Session, onSelect: () => void, onDelete: () => void, onStop: () => void }) {
    const { selectedSession } = useSelectedSession();
    const isLive = session.endTime === null;

    return (
        <div className={cn(
            "flex items-center justify-between w-full rounded-md hover:bg-muted/50",
            selectedSession?.id === session.id && "bg-muted"
        )}>
            <Button
                variant="ghost"
                className="flex-1 justify-start text-left h-auto p-2"
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
            <div className="flex items-center">
              {isLive && (
                 <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground hover:text-destructive" onClick={onStop}>
                    <StopCircle className="size-4" />
                    <span className="sr-only">Stop session</span>
                </Button>
              )}
              <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground hover:text-destructive" onClick={onDelete}>
                  <Trash2 className="size-4" />
                  <span className="sr-only">Delete session</span>
              </Button>
            </div>
        </div>
    )
}

export function SessionHistoryDialog() {
  const { user } = useFirebase();
  const firestore = useFirestore();
  const { selectedSession, setSelectedSession, isCollecting, setIsCollecting, setActiveSession } = useSelectedSession();
  const [isOpen, setIsOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<Session | null>(null);

  const sessionsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, 'users', user.uid, 'sessions'), orderBy('startTime', 'desc'));
  }, [user, firestore]);

  const { data: sessions, isLoading: sessionsLoading } = useCollection<Session>(sessionsQuery);

  const handleSessionSelect = (session: Session) => {
    setSelectedSession(session);
    setIsOpen(false);
  }

  const handleDeleteClick = (session: Session) => {
    setSessionToDelete(session);
  };

  const handleStopSession = (session: Session) => {
    if (!user || !firestore) return;
    
    updateDocumentNonBlocking(
      doc(firestore, 'users', user.uid, 'sessions', session.id),
      { endTime: Date.now() }
    );
    
    // If the stopped session is the currently active one, update global state
    if (selectedSession?.id === session.id) {
        setIsCollecting(false);
        setActiveSession(null);
    }
    toast({ title: 'Session Ended', description: `${session.locationName ?? 'The session'} has been stopped.` });
  }
  
  const confirmDelete = () => {
    if (!sessionToDelete || !user || !firestore) return;
  
    deleteDocumentNonBlocking(doc(firestore, 'users', user.uid, 'sessions', sessionToDelete.id));

    toast({
      title: 'Session Deleted',
      description: `${sessionToDelete.locationName ?? 'The session'} has been removed.`,
    });
  
    if (selectedSession?.id === sessionToDelete.id) {
      setSelectedSession(null);
    }
    setSessionToDelete(null);
  };

  return (
    <>
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <History className="mr-2" />
          <span className="hidden sm:inline">Session History</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Session History</DialogTitle>
          <DialogDescription>
            Select a session to view its details.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto">
            {sessionsLoading && <p className="p-2 text-sm text-muted-foreground">Loading sessions...</p>}
            {(!sessions || sessions.length === 0) && !isCollecting && (
                <p className="p-2 text-sm text-muted-foreground">
                    No sessions found. Start a new session from the dashboard to begin.
                </p>
            )}
            <div className="flex flex-col gap-1">
                {sessions && sessions.map((session) => (
                    <SessionItem 
                        key={session.id} 
                        session={session} 
                        onSelect={() => handleSessionSelect(session)}
                        onDelete={() => handleDeleteClick(session)}
                        onStop={() => handleStopSession(session)}
                    />
                ))}
            </div>
        </div>
      </DialogContent>
    </Dialog>

    <AlertDialog open={!!sessionToDelete} onOpenChange={(open) => !open && setSessionToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the
                session and all its associated signal data.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSessionToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete
            </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
