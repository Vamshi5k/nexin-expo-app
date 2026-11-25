export type FleetUserDto = {
  id: number | string;
  fleetId?: number | string | null;
  name?: string | null;
  phone?: string | null;
  email?: string | null;
  drId?: string | null;
  status?: string | null;
};

export type FleetUser = {
  id: string;
  fleetId: string | null;
  name: string;
  phone: string | null;
  email: string | null;
  driverId: string | null;
};

export type FleetLoginDto = { driverId?: number | string | null };
