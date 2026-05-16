import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { Session } from '../storage/authStore';
import { getSession, logout as storeLogout } from '../storage/authStore';

interface SessionContextValue {
  session: Session | null;
  setSession: (s: Session | null) => void;
  logout: () => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSessionState] = useState<Session | null>(() => getSession());

  const setSession = useCallback((s: Session | null) => {
    setSessionState(s);
  }, []);

  const logout = useCallback(() => {
    storeLogout();
    setSessionState(null);
  }, []);

  return (
    <SessionContext.Provider value={{ session, setSession, logout }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used inside SessionProvider');
  return ctx;
}
