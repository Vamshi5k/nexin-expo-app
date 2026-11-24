import { api, unwrap, type Envelope } from '@/core/api';

import type { FleetUserDto, FleetUser } from './types';

export async function getFleetUserByToken(): Promise<FleetUserDto> {
  const res = await api.get<Envelope<FleetUserDto | null>>('/fleet/get-by-token');
  const data = unwrap(res);
  if (!data) throw new Error('Fleet user not found');
  return data;
}

export async function fleetLogout(): Promise<void> {
  await api.get('/fleet/logout');
}

const str = (v: string | null | undefined): string | null => (v && v.trim() ? v.trim() : null);

export function toFleetUser(dto: FleetUserDto): FleetUser {
  return {
    id: String(dto.id),
    fleetId: dto.fleetId == null ? null : String(dto.fleetId),
    name: str(dto.name) ?? '',
    phone: str(dto.phone),
    email: str(dto.email),
    driverId: str(dto.drId),
  };
}
