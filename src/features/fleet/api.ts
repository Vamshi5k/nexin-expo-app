import { api, unwrap, type Envelope } from '@/core/api';

import type { FleetUserDto } from './types';

/** Fleet driver for the stored fleet token (startup session check). */
export async function getFleetUserByToken(): Promise<FleetUserDto> {
  const res = await api.get<Envelope<FleetUserDto | null>>('/fleet/get-by-token');
  const data = unwrap(res);
  if (!data) throw new Error('Fleet user not found');
  return data;
}

/** Fleet logout is a GET (BLUEPRINT), unlike the consumer POST /auth/logout. */
export async function fleetLogout(): Promise<void> {
  await api.get('/fleet/logout');
}
