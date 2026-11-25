import { createContext, useContext, useMemo, type ReactNode } from 'react';

import { useSessionData, type LoadStatus } from '@/core/request';
import { useSession, type SessionMode } from '@/core/session';

import { fleetApi } from '../api/fleet.api';
import type { FleetUser } from '../types/fleet.types';

type FleetContextType = {
  mode: SessionMode;
  driver: FleetUser | null;
  driverStatus: LoadStatus;
  driverError: unknown;
  loadDriver: () => Promise<FleetUser>;
};

const FleetContext = createContext<FleetContextType | undefined>(undefined);

type FleetProviderProps = {
  children: ReactNode;
};

export const FleetProvider = ({ children }: FleetProviderProps) => {
  const mode = useSession(s => s.mode);
  const driver = useSessionData(fleetApi.getDriver);

  const value = useMemo<FleetContextType>(
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
};

export const useFleet = (): FleetContextType => {
  const context = useContext(FleetContext);
  if (!context) {
    throw new Error('useFleet must be used inside FleetProvider');
  }
  return context;
};
