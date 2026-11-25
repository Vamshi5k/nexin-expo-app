import { createContext, useContext, useMemo, type ReactNode } from 'react';

import { useSessionData, type LoadStatus } from '@/core/request';
import { useSession, type SessionMode } from '@/core/session';

import { getDriver } from './api';
import type { FleetUser } from './types';

type FleetValue = {
  mode: SessionMode;
  driver: FleetUser | null;
  driverStatus: LoadStatus;
  driverError: unknown;
  loadDriver: () => Promise<FleetUser>;
};

const FleetContext = createContext<FleetValue | null>(null);

export function FleetProvider({ children }: { children: ReactNode }) {
  const mode = useSession(s => s.mode);
  const driver = useSessionData(getDriver);

  const value = useMemo(
    () => ({
      mode,
      driver: driver.data,
      driverStatus: driver.status,
      driverError: driver.error,
      loadDriver: driver.load,
    }),
    [mode, driver.data, driver.status, driver.error, driver.load],
  );
  return <FleetContext.Provider value={value}>{children}</FleetContext.Provider>;
}

export function useFleet(): FleetValue {
  const ctx = useContext(FleetContext);
  if (!ctx) throw new Error('useFleet must be used inside FleetProvider');
  return ctx;
}
