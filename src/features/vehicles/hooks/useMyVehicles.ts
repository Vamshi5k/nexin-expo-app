import { useCallback, useRef, useState } from 'react';

import { router, useFocusEffect } from 'expo-router';

import { getErrorMessage } from '@/core/api';
import { useRequest } from '@/core/request';
import { toast } from '@/shared/utils/toast';

import { vehiclesApi } from '../api/vehicles.api';
import { VEHICLES_COPY, VEHICLES_HREF } from '../constants/vehicles.constants';
import type { Vehicle } from '../types/vehicles.types';
import { canAutoCharge, sortVehicles, vehicleTitle, withPrimary } from '../utils/vehicles';

// The list with optimistic auto-charge, primary and delete: the screen changes at once and
// rolls back if the server says no. Coming back refreshes it quietly.
export const useMyVehicles = () => {
  const request = useRequest(vehiclesApi.getVehicles);
  const [autoCharge, setAutoCharge] = useState<Record<string, boolean>>({});
  const [primaryId, setPrimaryId] = useState<string | null>(null);
  const [removed, setRemoved] = useState<string[]>([]);
  const [busy, setBusy] = useState<string[]>([]);
  const [sheetFor, setSheetFor] = useState<Vehicle | null>(null);
  const [deleteFor, setDeleteFor] = useState<Vehicle | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const firstFocus = useRef(true);
  const { refetch } = request;

  // Fresh server data replaces the optimistic edits.
  const reload = useCallback(async () => {
    await refetch();
    setAutoCharge({});
    setPrimaryId(null);
    setRemoved([]);
  }, [refetch]);

  useFocusEffect(
    useCallback(() => {
      if (firstFocus.current) {
        firstFocus.current = false;
        return;
      }
      void reload();
    }, [reload]),
  );

  const base = (request.data ?? [])
    .filter(vehicle => !removed.includes(vehicle.id))
    .map(vehicle =>
      vehicle.id in autoCharge ? { ...vehicle, autoCharge: autoCharge[vehicle.id]! } : vehicle,
    );
  const vehicles = sortVehicles(primaryId ? withPrimary(base, primaryId) : base);
  const title = (vehicle: Vehicle) => vehicleTitle(vehicle, VEHICLES_COPY.unknownModel);

  const track = (id: string, on: boolean) =>
    setBusy(current => (on ? [...current, id] : current.filter(item => item !== id)));

  const toggleAutoCharge = async (vehicle: Vehicle) => {
    if (busy.includes(vehicle.id)) return;
    if (!canAutoCharge(vehicle)) {
      toast.info(VEHICLES_COPY.needsMac);
      return;
    }

    const next = !vehicle.autoCharge;
    setAutoCharge(current => ({ ...current, [vehicle.id]: next }));
    track(vehicle.id, true);
    try {
      await vehiclesApi.setAutoCharge(vehicle.id, next);
      toast.success(next ? VEHICLES_COPY.autoChargeEnabled : VEHICLES_COPY.autoChargeDisabled);
    } catch (error) {
      setAutoCharge(current => ({ ...current, [vehicle.id]: !next }));
      toast.error(getErrorMessage(error));
    } finally {
      track(vehicle.id, false);
    }
  };

  const makePrimary = async (vehicle: Vehicle) => {
    setSheetFor(null);
    if (vehicle.isPrimary || busy.includes(vehicle.id)) return;

    const before = primaryId;
    setPrimaryId(vehicle.id);
    track(vehicle.id, true);
    try {
      await vehiclesApi.setPrimary(vehicle.id);
      toast.success(VEHICLES_COPY.madePrimary(title(vehicle)));
    } catch (error) {
      setPrimaryId(before);
      toast.error(getErrorMessage(error));
    } finally {
      track(vehicle.id, false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteFor || deleting) return;

    setDeleting(true);
    try {
      await vehiclesApi.deleteVehicle(deleteFor.id);
      setRemoved(current => [...current, deleteFor.id]);
      setDeleteFor(null);
      toast.success(VEHICLES_COPY.removed);
      // The server may pick a new primary; take its word for it.
      void reload();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setDeleting(false);
    }
  };

  const refresh = async () => {
    if (refreshing) return;

    setRefreshing(true);
    await reload();
    setRefreshing(false);
  };

  return {
    vehicles,
    title,
    loading: !request.data && request.loading,
    failed: !request.data && !request.loading && !!request.error,
    errorMessage: getErrorMessage(request.error),
    empty: !!request.data && vehicles.length === 0,
    refreshing,
    refresh: () => void refresh(),
    retry: () => void refetch(),
    isBusy: (vehicle: Vehicle) => busy.includes(vehicle.id),
    toggleAutoCharge: (vehicle: Vehicle) => void toggleAutoCharge(vehicle),
    openEdit: (vehicle: Vehicle) => {
      setSheetFor(null);
      router.push({
        pathname: '/(app)/vehicles/[vehicleId]/edit',
        params: { vehicleId: vehicle.id },
      });
    },
    openAdd: () => router.push(VEHICLES_HREF.add),
    sheetFor,
    openSheet: (vehicle: Vehicle) => setSheetFor(vehicle),
    closeSheet: () => setSheetFor(null),
    makePrimary: (vehicle: Vehicle) => void makePrimary(vehicle),
    deleteFor,
    askDelete: (vehicle: Vehicle) => {
      setSheetFor(null);
      setDeleteFor(vehicle);
    },
    cancelDelete: () => setDeleteFor(null),
    confirmDelete: () => void confirmDelete(),
    deleting,
    isOnly: vehicles.length === 1,
  };
};
