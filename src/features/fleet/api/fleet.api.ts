import { api, unwrap, type Envelope } from '@/core/api';
import { ENDPOINTS } from '@/core/endpoints';

import { FLEET_LOGOUT_TIMEOUT_MS } from '../constants/fleet.constants';
import type { FleetUser, FleetUserDto } from '../types/fleet.types';

const str = (v: string | null | undefined): string | null => (v && v.trim() ? v.trim() : null);

export const toFleetUser = (dto: FleetUserDto): FleetUser => ({
  id: String(dto.id),
  fleetId: dto.fleetId == null ? null : String(dto.fleetId),
  name: str(dto.name) ?? '',
  phone: str(dto.phone),
  email: str(dto.email),
  driverId: str(dto.drId),
});

export const fleetApi = {
  getDriver: async (): Promise<FleetUser> => {
    const res = await api.get<Envelope<FleetUserDto | null>>(ENDPOINTS.FLEET.DRIVER);
    const data = unwrap(res);
    if (!data) {
      throw new Error('Fleet user not found');
    }
    return toFleetUser(data);
  },

  // Runs after the session is cleared, so it sends the captured token and never refreshes.
  logout: async (accessToken: string | null): Promise<void> => {
    await api.get(ENDPOINTS.FLEET.LOGOUT, {
      authToken: accessToken,
      timeout: FLEET_LOGOUT_TIMEOUT_MS,
    });
  },
};
