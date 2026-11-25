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
