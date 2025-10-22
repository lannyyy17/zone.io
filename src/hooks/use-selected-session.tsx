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
  isCollecting: boolean;
  setIsCollecting: Dispatch<SetStateAction<boolean>>;
}

const SelectedSessionContext = createContext<
  SelectedSessionContextType | undefined
>(undefined);

export function SelectedSessionProvider({ children }: { children: ReactNode }) {
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [isCollecting, setIsCollecting] = useState<boolean>(false);
  
  return (
    <SelectedSessionContext.Provider
      value={{ selectedSession, setSelectedSession, isCollecting, setIsCollecting }}
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

    