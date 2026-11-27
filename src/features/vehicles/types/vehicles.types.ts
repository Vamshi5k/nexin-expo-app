export type NamedDto = { id: number | string; name?: string | null };

export type CapacityDto = {
  id: number | string;
  capacity?: number | string | null;
  value?: number | string | null;
  range?: number | string | null;
};

export type AddVehicleBody = {
  modelId: number | string;
  regNo: string;
  capacityId?: number | string;
  capacity?: number;
  vinNumber?: string;
  maxAmount?: number;
};

export type Brand = { id: string; name: string };
export type Model = { id: string; name: string };
export type Capacity = { id: string; kwh: number; rangeKm: number | null };

// A capacity picked from the list, or typed in with "Custom".
export type CapacityChoice =
  { kind: 'preset'; capacity: Capacity } | { kind: 'custom'; kwh: number };

export type VehicleDetails = { regNo: string; macId: string; maxAmount: string };

export type NewVehicle = {
  model: Model;
  capacity: CapacityChoice;
  details: VehicleDetails;
};

export type WizardStep = 'brand' | 'model' | 'capacity' | 'details';

export type VehicleDto = {
  id: number | string;
  regNo?: string | null;
  vinNumber?: string | null;
  maxAmount?: number | string | null;
  autoCharge?: boolean | null;
  isPrimary?: boolean | null;
  capacityId?: number | string | null;
  capacity?: number | string | { capacity?: number | string | null } | null;
  range?: number | string | null;
  modelId?: number | string | null;
  model?: {
    id?: number | string | null;
    name?: string | null;
    brand?: { id?: number | string | null; name?: string | null } | null;
  } | null;
};

export type Vehicle = {
  id: string;
  regNo: string;
  macId: string | null;
  maxAmountRupees: number | null;
  autoCharge: boolean;
  isPrimary: boolean;
  capacityId: string | null;
  capacityKwh: number | null;
  rangeKm: number | null;
  modelId: string | null;
  modelName: string;
  brandId: string | null;
  brandName: string;
};

// What Edit shows and saves: the picked model and battery plus the typed details.
export type VehiclePick = { brand: Brand | null; model: Model; capacity: CapacityChoice };
