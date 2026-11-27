import type { CapacityChoice, Model, Vehicle, VehicleDetails } from '../types/vehicles.types';

// "Tata Nexon EV", or just the model, or nothing when both are missing.
export const vehicleTitle = (vehicle: Pick<Vehicle, 'brandName' | 'modelName'>, fallback: string) =>
  [vehicle.brandName, vehicle.modelName].filter(Boolean).join(' ') || fallback;

// The primary vehicle first, then newest first (higher id), as the API has no created date.
export function sortVehicles(vehicles: Vehicle[]): Vehicle[] {
  const byId = (a: Vehicle, b: Vehicle) => {
    const x = Number(a.id);
    const y = Number(b.id);
    return Number.isFinite(x) && Number.isFinite(y) ? y - x : b.id.localeCompare(a.id);
  };
  return [...vehicles].sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary) || byId(a, b));
}

// Only one vehicle can be primary: the new one gains it, every other loses it.
export const withPrimary = (vehicles: Vehicle[], vehicleId: string): Vehicle[] =>
  vehicles.map(vehicle => ({ ...vehicle, isPrimary: vehicle.id === vehicleId }));

// Auto-charge identifies the vehicle by its MAC ID, so it needs one.
export const canAutoCharge = (vehicle: Pick<Vehicle, 'macId'>) => !!vehicle.macId;

// What Edit starts from: the saved model and battery (a preset when its id is known, else the
// stored kWh as a custom value) and the typed details.
export function editDraft(vehicle: Vehicle): {
  model: Model | null;
  capacity: CapacityChoice | null;
  details: VehicleDetails;
} {
  const model = vehicle.modelId ? { id: vehicle.modelId, name: vehicle.modelName } : null;
  const kwh = vehicle.capacityKwh;
  const capacity: CapacityChoice | null =
    vehicle.capacityId && kwh !== null
      ? { kind: 'preset', capacity: { id: vehicle.capacityId, kwh, rangeKm: vehicle.rangeKm } }
      : kwh !== null
        ? { kind: 'custom', kwh }
        : null;

  return {
    model,
    capacity,
    details: {
      regNo: vehicle.regNo,
      macId: vehicle.macId ?? '',
      maxAmount: vehicle.maxAmountRupees !== null ? String(vehicle.maxAmountRupees) : '',
    },
  };
}

export const sameDetails = (a: VehicleDetails, b: VehicleDetails) =>
  a.regNo.trim().toUpperCase() === b.regNo.trim().toUpperCase() &&
  a.macId.trim().toUpperCase() === b.macId.trim().toUpperCase() &&
  a.maxAmount.trim() === b.maxAmount.trim();

export const sameCapacity = (a: CapacityChoice | null, b: CapacityChoice | null) => {
  if (!a || !b) return a === b;
  if (a.kind === 'preset' && b.kind === 'preset') return a.capacity.id === b.capacity.id;
  if (a.kind === 'custom' && b.kind === 'custom') return a.kwh === b.kwh;
  return false;
};
