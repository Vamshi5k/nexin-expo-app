import { api, unwrap, type Envelope } from '@/core/api';
import { ENDPOINTS } from '@/core/endpoints';

import type {
  ProfileChangesDto,
  ProfileDto,
  ProfileStats,
  ProfileStatsDto,
} from '../types/profile.types';

const count = (value: number | string | null | undefined): number | null => {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : null;
};

export const toProfileStats = (dto: ProfileStatsDto | null | undefined): ProfileStats => ({
  vehicles: count(dto?.totalVehicles),
  sessions: count(dto?.totalChargingSessions),
  favourites: count(dto?.totalFavourites),
});

export const profileApi = {
  getStats: async (): Promise<ProfileStats> => {
    const res = await api.get<Envelope<ProfileDto>>(ENDPOINTS.PROFILE.GET);
    return toProfileStats(unwrap(res)?.stats);
  },

  update: async (changes: ProfileChangesDto): Promise<void> => {
    await api.put(ENDPOINTS.PROFILE.UPDATE, changes);
  },

  sendOtp: async (contact: string): Promise<void> => {
    await api.post(ENDPOINTS.PROFILE.SEND_OTP, { contact });
  },

  verifyOtp: async (contact: string, otp: string): Promise<void> => {
    await api.post(ENDPOINTS.PROFILE.VERIFY_OTP, { contact, otp });
  },

  // TODO(backend): unconfirmed endpoint and OTP re-check (OPEN_QUESTIONS #19); not called while
  // DELETE_ACCOUNT_API_ENABLED is off.
  deleteAccount: async (): Promise<void> => {
    await api.delete(ENDPOINTS.PROFILE.DELETE);
  },
};
