'use client';

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  Dispatch,
  SetStateAction
} from 'react';
import type { Session, NetworkSignal } from '@/lib/types';

interface SelectedSessionContextType {
  selectedSession: Session | null;
  setSelectedSession: Dispatch<SetStateAction<Session | null>>;
  sessions: Session[];
  setSessions: Dispatch<SetStateAction<Session[]>>;
  isCollecting: boolean;
  setIsCollecting: Dispatch<SetStateAction<boolean>>;
  signalData: NetworkSignal[];
  setSignalData: Dispatch<SetStateAction<NetworkSignal[]>>;
}

const SelectedSessionContext = createContext<
  SelectedSessionContextType | undefined
>(undefined);

export function SelectedSessionProvider({ children }: { children: ReactNode }) {
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isCollecting, setIsCollecting] = useState<boolean>(false);
  const [signalData, setSignalData] = useState<NetworkSignal[]>([]);
  
  return (
    <SelectedSessionContext.Provider
      value={{ selectedSession, setSelectedSession, sessions, setSessions, isCollecting, setIsCollecting, signalData, setSignalData }}
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
