import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { sessionStore, signOutThen, useSession, type SessionMode } from '@/core/session';

import { fleetLogout, getFleetUserByToken, toFleetUser } from './api';
import type { FleetUser } from './types';

export type DriverStatus = 'idle' | 'loading' | 'ready' | 'error';

type FleetValue = {
  mode: SessionMode;
  driver: FleetUser | null;
  driverStatus: DriverStatus;
  driverError: unknown;
  loadDriver: () => Promise<FleetUser>;
  logout: () => Promise<void>;
};

type DriverState = Pick<FleetValue, 'driver' | 'driverStatus' | 'driverError'>;
const EMPTY: DriverState = { driver: null, driverStatus: 'idle', driverError: null };

const FleetContext = createContext<FleetValue | null>(null);

export function FleetProvider({ children }: { children: ReactNode }) {
  const mode = useSession((s) => s.mode);
  const [state, setState] = useState<DriverState>(EMPTY);
  // Bumped on every session change so a response for the previous session is dropped.
  const generation = useRef(0);

  useEffect(
    () =>
      sessionStore.subscribe((next, prev) => {
        if (next.mode === prev.mode) return;
        generation.current++;
        setState(EMPTY);
      }),
    [],
  );

  const loadDriver = useCallback(async () => {
    const gen = generation.current;
    setState((s) => ({ ...s, driverStatus: 'loading', driverError: null }));
    try {
      const driver = toFleetUser(await getFleetUserByToken());
      if (gen === generation.current)
        setState({ driver, driverStatus: 'ready', driverError: null });
      return driver;
    } catch (error) {
      if (gen === generation.current)
        setState((s) => ({ ...s, driverStatus: 'error', driverError: error }));
      throw error;
    }
  }, []);

  const logout = useCallback(() => signOutThen((_, token) => fleetLogout(token)), []);

  const value = useMemo(
    () => ({ mode, ...state, loadDriver, logout }),
    [mode, state, loadDriver, logout],
  );
  return <FleetContext.Provider value={value}>{children}</FleetContext.Provider>;
}

export function useFleet(): FleetValue {
  const ctx = useContext(FleetContext);
  if (!ctx) throw new Error('useFleet must be used inside FleetProvider');
  return ctx;
}
