'use client';

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  Dispatch,
  SetStateAction
} from 'react';
import type { Session } from '@/lib/types';

interface SelectedSessionContextType {
  selectedSession: Session | null;
  setSelectedSession: Dispatch<SetStateAction<Session | null>>;
  activeSession: Session | null; // The currently "live" session
  setActiveSession: Dispatch<SetStateAction<Session | null>>;
  isCollecting: boolean;
  setIsCollecting: Dispatch<SetStateAction<boolean>>;
}

const SelectedSessionContext = createContext<
  SelectedSessionContextType | undefined
>(undefined);

export function SelectedSessionProvider({ children }: { children: ReactNode }) {
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [isCollecting, setIsCollecting] = useState<boolean>(false);
  
  return (
    <SelectedSessionContext.Provider
      value={{ 
        selectedSession, 
        setSelectedSession, 
        isCollecting, 
        setIsCollecting,
        activeSession,
        setActiveSession
      }}
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
