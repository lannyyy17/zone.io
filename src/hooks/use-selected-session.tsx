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
}

const SelectedSessionContext = createContext<
  SelectedSessionContextType | undefined
>(undefined);

export function SelectedSessionProvider({ children }: { children: ReactNode }) {
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [sessions, setSessions] = useState<Session[]>(initialMockSessions);
  
  // When sessions list changes (e.g. name update), find the selected session
  // in the new list and update it to maintain consistency.
  useEffect(() => {
    if(selectedSession) {
        const updatedSelected = sessions.find(s => s.id === selectedSession.id);
        if (updatedSelected) {
            setSelectedSession(updatedSelected);
        }
    }
  }, [sessions, selectedSession?.id]);


  return (
    <SelectedSessionContext.Provider
      value={{ selectedSession, setSelectedSession, sessions, setSessions }}
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
