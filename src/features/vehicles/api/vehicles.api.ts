import { api, unwrap, type Envelope } from '@/core/api';
import { ENDPOINTS } from '@/core/endpoints';

import type {
  AddVehicleBody,
  Brand,
  Capacity,
  CapacityDto,
  Model,
  NamedDto,
  NewVehicle,
  Vehicle,
  VehicleDto,
} from '../types/vehicles.types';

const num = (v: number | string | null | undefined): number | null => {
  const n = typeof v === 'string' ? Number(v) : v;
  return typeof n === 'number' && Number.isFinite(n) ? n : null;
};

// The server sent numeric ids; send them back as numbers.
const apiId = (id: string): number | string => (/^\d+$/.test(id) ? Number(id) : id);

export const toNamed = (dto: NamedDto): Brand => ({
  id: String(dto.id),
  name: dto.name?.trim() || '—',
});

export const toCapacity = (dto: CapacityDto): Capacity | null => {
  const kwh = num(dto.capacity ?? dto.value);
  if (kwh === null) {
    return null;
  }

  return { id: String(dto.id), kwh, rangeKm: num(dto.range) };
};

export const toAddVehicleBody = ({ model, capacity, details }: NewVehicle): AddVehicleBody => {
  const mac = details.macId.trim().toUpperCase();
  const amount = details.maxAmount.trim();

  return {
    modelId: apiId(model.id),
    regNo: details.regNo.trim().toUpperCase(),
    ...(capacity.kind === 'preset'
      ? { capacityId: apiId(capacity.capacity.id) }
      : { capacity: capacity.kwh }),
    ...(mac ? { vinNumber: mac } : {}),
    ...(amount ? { maxAmount: Number(amount) } : {}),
  };
};

const text = (v: string | null | undefined): string | null => {
  const trimmed = v?.trim();
  return trimmed ? trimmed : null;
};

const optionalId = (v: number | string | null | undefined): string | null =>
  v === null || v === undefined || v === '' ? null : String(v);

// `capacity` arrives as a number or as { capacity } depending on the endpoint.
export const toVehicle = (dto: VehicleDto): Vehicle => {
  const capacity =
    dto.capacity && typeof dto.capacity === 'object' ? dto.capacity.capacity : dto.capacity;

  return {
    id: String(dto.id),
    regNo: text(dto.regNo)?.toUpperCase() ?? '',
    macId: text(dto.vinNumber),
    maxAmountRupees: num(dto.maxAmount),
    autoCharge: dto.autoCharge === true,
    isPrimary: dto.isPrimary === true,
    capacityId: optionalId(dto.capacityId),
    capacityKwh: num(capacity),
    rangeKm: num(dto.range),
    modelId: optionalId(dto.modelId ?? dto.model?.id),
    modelName: text(dto.model?.name) ?? '',
    brandId: optionalId(dto.model?.brand?.id),
    brandName: text(dto.model?.brand?.name) ?? '',
  };
};

export const vehiclesApi = {
  getBrands: async (): Promise<Brand[]> => {
    const res = await api.get<Envelope<NamedDto[]>>(ENDPOINTS.VEHICLES.BRANDS);
    return (unwrap(res) ?? []).map(toNamed);
  },

  getModels: async (brandId: string): Promise<Model[]> => {
    const res = await api.get<Envelope<NamedDto[]>>(ENDPOINTS.VEHICLES.MODELS(brandId));
    return (unwrap(res) ?? []).map(toNamed);
  },

  getCapacities: async (modelId: string): Promise<Capacity[]> => {
    const res = await api.get<Envelope<CapacityDto[]>>(ENDPOINTS.VEHICLES.CAPACITIES(modelId));
    return (unwrap(res) ?? []).map(toCapacity).filter((c): c is Capacity => c !== null);
  },

  addVehicle: async (vehicle: NewVehicle): Promise<void> => {
    await api.post(ENDPOINTS.VEHICLES.ADD, toAddVehicleBody(vehicle));
  },

  getVehicles: async (): Promise<Vehicle[]> => {
    const res = await api.get<Envelope<VehicleDto[] | null>>(ENDPOINTS.VEHICLES.LIST);
    return (unwrap(res) ?? []).map(toVehicle);
  },

  // TODO(backend): an emptied MAC ID or max amount is left out, as on add; confirm how to clear
  // one on edit (OPEN_QUESTIONS #23).
  updateVehicle: async (vehicleId: string, vehicle: NewVehicle): Promise<void> => {
    await api.put(ENDPOINTS.VEHICLES.ITEM(vehicleId), toAddVehicleBody(vehicle));
  },

  setAutoCharge: async (vehicleId: string, autoCharge: boolean): Promise<void> => {
    await api.patch(ENDPOINTS.VEHICLES.ITEM(vehicleId), { autoCharge });
  },

  setPrimary: async (vehicleId: string): Promise<void> => {
    await api.patch(ENDPOINTS.VEHICLES.PRIMARY(vehicleId));
  },

  deleteVehicle: async (vehicleId: string): Promise<void> => {
    await api.delete(ENDPOINTS.VEHICLES.ITEM(vehicleId));
  },
};
