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
import { History, MapPin, Dot, Trash2, X, BarChart } from 'lucide-react';
import { useSelectedSession } from '@/hooks/use-selected-session';
import type { Session, NetworkSignal } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useFirebase, useFirestore, useCollection } from '@/firebase';
import { collection, query, orderBy, doc, getDocs } from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/provider';
import { useState, useMemo } from 'react';
import { deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { toast } from '@/hooks/use-toast';
import { Checkbox } from './ui/checkbox';
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
  } from '@/components/ui/chart';
import { Line, LineChart, CartesianGrid, XAxis, YAxis, Legend, Tooltip } from 'recharts';

function SessionItem({ session, onSelect, onDelete, onCompareToggle, isComparing }: { session: Session, onSelect: () => void, onDelete: () => void, onCompareToggle: (checked: boolean) => void, isComparing: boolean }) {
    const { selectedSession } = useSelectedSession();
    const isLive = session.endTime === null;

    return (
        <div className={cn(
            "flex items-center justify-between w-full rounded-md hover:bg-muted/50",
            selectedSession?.id === session.id && "bg-muted"
        )}>
            <div className="flex items-center p-2">
                <Checkbox
                    id={`compare-${session.id}`}
                    checked={isComparing}
                    onCheckedChange={onCompareToggle}
                />
            </div>
            <Button
                variant="ghost"
                className="flex-1 justify-start text-left h-auto"
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
            <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground hover:text-destructive" onClick={onDelete}>
                <Trash2 className="size-4" />
                <span className="sr-only">Delete session</span>
            </Button>
        </div>
    )
}

function ComparisonChart({ sessionIdsToCompare }: { sessionIdsToCompare: string[] }) {
    const { user } = useFirebase();
    const firestore = useFirestore();
    const [chartData, setChartData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (!firestore || !user || sessionIdsToCompare.length < 1) {
                setChartData([]);
                return;
            }
            setIsLoading(true);
            
            const allSeries: { [key: string]: { name: string, data: { time: number, signal: number }[] } } = {};
            let maxDataPoints = 0;

            for (const sessionId of sessionIdsToCompare) {
                const signalsCollection = collection(firestore, 'users', user.uid, 'sessions', sessionId, 'signals');
                const signalsSnapshot = await getDocs(query(signalsCollection, orderBy('timestamp')));
                const sessionDoc = await doc(firestore, 'users', user.uid, 'sessions', sessionId).get();
                const sessionName = sessionDoc.data()?.locationName ?? `Session ${sessionId.slice(0,4)}`;
                
                const seriesData = signalsSnapshot.docs.map((doc, index) => ({
                    time: index, // Use index as a common x-axis
                    signal: doc.data().signalStrength,
                }));
                
                allSeries[sessionId] = { name: sessionName, data: seriesData };
                if (seriesData.length > maxDataPoints) {
                    maxDataPoints = seriesData.length;
                }
            }

            // Combine data for Recharts
            const combinedData: any[] = [];
            for (let i = 0; i < maxDataPoints; i++) {
                const dataPoint: { [key: string]: any } = { time: i };
                for (const sessionId of sessionIdsToCompare) {
                    if (allSeries[sessionId] && allSeries[sessionId].data[i]) {
                        dataPoint[allSeries[sessionId].name] = allSeries[sessionId].data[i].signal;
                    }
                }
                combinedData.push(dataPoint);
            }
            
            setChartData(combinedData);
            setIsLoading(false);
        };
        fetchData();
    }, [sessionIdsToCompare, firestore, user]);

    const sessionNames = useMemo(() => chartData.length > 0 ? Object.keys(chartData[0]).filter(key => key !== 'time') : [], [chartData]);
    const chartColors = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];


    if (sessionIdsToCompare.length === 0) return null;

    if (isLoading) {
        return <div className="text-center text-muted-foreground p-4">Loading comparison data...</div>;
    }

    return (
        <div className="mt-4 p-4 border-t">
            <h4 className="mb-4 text-lg font-semibold">Session Comparison</h4>
            <ChartContainer config={{}} className="h-64 w-full">
                <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 0 }}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="time" label={{ value: "Data Point Index", position: 'insideBottom', offset: -5 }} />
                    <YAxis label={{ value: "Signal (dBm)", angle: -90, position: 'insideLeft' }}/>
                    <Tooltip content={<ChartTooltipContent indicator="dot" />} />
                    <Legend />
                    {sessionNames.map((name, index) => (
                        <Line
                          key={name}
                          type="monotone"
                          dataKey={name}
                          stroke={chartColors[index % chartColors.length]}
                          dot={false}
                        />
                    ))}
                </LineChart>
            </ChartContainer>
        </div>
    )
}

export function SessionHistoryDialog() {
  const { user } = useFirebase();
  const firestore = useFirestore();
  const { selectedSession, setSelectedSession, isCollecting } = useSelectedSession();
  const [isOpen, setIsOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<Session | null>(null);
  const [sessionIdsToCompare, setSessionIdsToCompare] = useState<string[]>([]);

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

  const handleCompareToggle = (sessionId: string, checked: boolean) => {
    setSessionIdsToCompare(prev =>
      checked ? [...prev, sessionId] : prev.filter(id => id !== sessionId)
    );
  };
  
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
    // Also remove from comparison if it's there
    setSessionIdsToCompare(prev => prev.filter(id => id !== sessionToDelete.id));
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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Session History</DialogTitle>
          <DialogDescription>
            Select a session to view its details, or use the checkboxes to compare multiple sessions.
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
                        onCompareToggle={(checked) => handleCompareToggle(session.id, !!checked)}
                        isComparing={sessionIdsToCompare.includes(session.id)}
                    />
                ))}
            </div>
        </div>
        <ComparisonChart sessionIdsToCompare={sessionIdsToCompare} />
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
