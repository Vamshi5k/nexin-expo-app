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
};
