'use client';

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  Dispatch,
  SetStateAction,
  useEffect,
} from 'react';
import type { Session } from '@/lib/types';
import { mockSessions as initialMockSessions } from '@/lib/mock-data';

interface SelectedSessionContextType {
  selectedSession: Session | null;
  setSelectedSession: Dispatch<SetStateAction<Session | null>>;
  sessions: Session[];
  setSessions: Dispatch<SetStateAction<Session[]>>;
  isCollecting: boolean;
  setIsCollecting: Dispatch<SetStateAction<boolean>>;
}

const SelectedSessionContext = createContext<
  SelectedSessionContextType | undefined
>(undefined);

export function SelectedSessionProvider({ children }: { children: ReactNode }) {
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [sessions, setSessions] = useState<Session[]>(initialMockSessions);
  const [isCollecting, setIsCollecting] = useState<boolean>(false);
  
  // When sessions list changes (e.g. name update), find the selected session
  // in the new list and update it to maintain consistency.
  useEffect(() => {
    if(selectedSession) {
        const updatedSelected = sessions.find(s => s.id === selectedSession.id);
        if (updatedSelected) {
            // Avoid re-setting if the object is identical, but allow updates
            if (JSON.stringify(updatedSelected) !== JSON.stringify(selectedSession)) {
                setSelectedSession(updatedSelected);
            }
        } else {
            // The selected session was removed from the list
            setSelectedSession(null);
        }
    }
  }, [sessions, selectedSession]);


  return (
    <SelectedSessionContext.Provider
      value={{ selectedSession, setSelectedSession, sessions, setSessions, isCollecting, setIsCollecting }}
    >
      {children}
    </SelectedSessionContext.Provider>
  );
}

export function useSelectedSession() {
  const context = useContext(SelectedSessionContext);
  if (context === undefined) {
    throw new Error(
      'useSelectedSession must be used within a SelectedSessionProvider'
    );
  }
  return context;
}
