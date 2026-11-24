import { api, unwrap, type Envelope } from '@/core/api';

import { FLEET_LOGOUT_TIMEOUT_MS } from './constants';
import type { FleetUser, FleetUserDto } from './types';

export async function getDriver(): Promise<FleetUser> {
  const res = await api.get<Envelope<FleetUserDto | null>>('/fleet/get-by-token');
  const data = unwrap(res);
  if (!data) throw new Error('Fleet user not found');
  return toFleetUser(data);
}

// Runs after the session is cleared, so it sends the captured token and never refreshes.
export async function fleetLogout(accessToken: string | null): Promise<void> {
  await api.get('/fleet/logout', { authToken: accessToken, timeout: FLEET_LOGOUT_TIMEOUT_MS });
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
