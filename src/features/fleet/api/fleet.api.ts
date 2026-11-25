import { api, readTokens, unwrap, type Envelope, type Tokens } from '@/core/api';
import { ENDPOINTS } from '@/core/endpoints';

import { FLEET_LOGOUT_TIMEOUT_MS } from '../constants/fleet.constants';
import type { FleetLoginDto, FleetUser, FleetUserDto } from '../types/fleet.types';

const str = (v: string | null | undefined): string | null => (v && v.trim() ? v.trim() : null);

export const toFleetUser = (dto: FleetUserDto): FleetUser => ({
  id: String(dto.id),
  fleetId: dto.fleetId == null ? null : String(dto.fleetId),
  name: str(dto.name) ?? '',
  phone: str(dto.phone),
  email: str(dto.email),
  driverId: str(dto.drId),
});

export const toDriverId = (dto: FleetLoginDto | null | undefined): string => {
  const id = dto?.driverId == null ? '' : String(dto.driverId).trim();
  if (!id) {
    throw new Error('Fleet login response did not include a driver id');
  }
  return id;
};

export const toFleetTokens = (body: unknown): Tokens => {
  const tokens = readTokens(body);
  if (!tokens) {
    throw new Error('Fleet verify response did not include tokens');
  }
  return tokens;
};

export const fleetApi = {
  // Sends the OTP and returns the driver id that resend needs.
  login: async (fleetId: string, contact: string): Promise<string> => {
    const res = await api.post<Envelope<FleetLoginDto | null>>(ENDPOINTS.FLEET.LOGIN, {
      fleetId,
      contact,
    });
    return toDriverId(unwrap(res));
  },

  verifyOtp: async (otp: string): Promise<Tokens> => {
    const res = await api.post<unknown>(ENDPOINTS.FLEET.VERIFY_OTP, { otp });
    return toFleetTokens(res.data);
  },

  resendOtp: async (driverId: string): Promise<void> => {
    await api.post(ENDPOINTS.FLEET.RESEND_OTP, { driverId });
  },

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
