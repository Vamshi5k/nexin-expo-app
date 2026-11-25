import type { InternalAxiosRequestConfig } from 'axios';

import { api } from '@/core/api';
import { brand } from '@/core/config';
import { authApi } from '@/features/auth/api/auth.api';
import { clientConfigApi } from '@/features/client-config/api/clientConfig.api';
import { fleetApi } from '@/features/fleet/api/fleet.api';
import { setupApi } from '@/features/setup/api/setup.api';
import { vehiclesApi } from '@/features/vehicles/api/vehicles.api';

// Paths are written out by hand from the old app (src/api/endpoints.ts and its call sites),
// not imported from ENDPOINTS, so a typo in ENDPOINTS fails here.

jest.mock('@/core/log');

type Seen = { method: string; url: string; data: unknown; params: unknown };

let seen: Seen[] = [];

const respond = (data: unknown) => {
  api.defaults.adapter = async (config: InternalAxiosRequestConfig) => {
    seen.push({
      method: (config.method ?? '').toUpperCase(),
      url: config.url ?? '',
      data: typeof config.data === 'string' ? JSON.parse(config.data) : config.data,
      params: config.params,
    });
    return { config, status: 200, statusText: 'OK', headers: {}, data };
  };
};

const lastCall = () => seen[seen.length - 1];

beforeEach(() => {
  seen = [];
  respond({ data: [] });
});

describe('api functions call the same paths as the old app', () => {
  it('authApi.requestOtp -> POST /auth/app/login { contact }', async () => {
    await authApi.requestOtp('9876543210');
    expect(lastCall()).toMatchObject({
      method: 'POST',
      url: '/auth/app/login',
      data: { contact: '9876543210' },
    });
  });

  it('authApi.verifyOtp -> POST /auth/app/verify { otp, appName }', async () => {
    respond({ userAccessToken: 'a', userRefreshToken: 'r' });
    await authApi.verifyOtp('1234');
    expect(lastCall()).toMatchObject({
      method: 'POST',
      url: '/auth/app/verify',
      data: { otp: '1234', appName: brand.apiAppName },
    });
  });

  it('authApi.getUser -> GET /auth/user-by-token', async () => {
    respond({ data: { user: { id: 1 } } });
    await authApi.getUser();
    expect(lastCall()).toMatchObject({ method: 'GET', url: '/auth/user-by-token' });
  });

  it('authApi.registerPushToken -> PUT /auth/fcm { fcmToken }', async () => {
    await authApi.registerPushToken('fcm-1');
    expect(lastCall()).toMatchObject({
      method: 'PUT',
      url: '/auth/fcm',
      data: { fcmToken: 'fcm-1' },
    });
  });

  it('authApi.logout -> POST /auth/logout with no body', async () => {
    await authApi.logout('tok');
    expect(lastCall()).toMatchObject({ method: 'POST', url: '/auth/logout' });
    expect(lastCall().data).toBeUndefined();
  });

  it('fleetApi.getDriver -> GET /fleet/get-by-token', async () => {
    respond({ data: { id: 1 } });
    await fleetApi.getDriver();
    expect(lastCall()).toMatchObject({ method: 'GET', url: '/fleet/get-by-token' });
  });

  it('fleetApi.login -> POST /fleet/login { fleetId, contact }, returns data.driverId', async () => {
    respond({ data: { driverId: 'DR-9' } });
    await expect(fleetApi.login('FLT-1', '9876543210')).resolves.toBe('DR-9');
    expect(lastCall()).toMatchObject({
      method: 'POST',
      url: '/fleet/login',
      data: { fleetId: 'FLT-1', contact: '9876543210' },
    });
  });

  it('fleetApi.verifyOtp -> POST /fleet/verify-otp { otp }, reads user tokens', async () => {
    respond({ userAccessToken: 'fa', userRefreshToken: 'fr' });
    await expect(fleetApi.verifyOtp('1234')).resolves.toEqual({
      accessToken: 'fa',
      refreshToken: 'fr',
    });
    expect(lastCall()).toMatchObject({
      method: 'POST',
      url: '/fleet/verify-otp',
      data: { otp: '1234' },
    });
  });

  it('fleetApi.resendOtp -> POST /fleet/resend-otp { driverId }', async () => {
    await fleetApi.resendOtp('DR-9');
    expect(lastCall()).toMatchObject({
      method: 'POST',
      url: '/fleet/resend-otp',
      data: { driverId: 'DR-9' },
    });
  });

  it('fleetApi.logout -> GET /fleet/logout', async () => {
    await fleetApi.logout('tok');
    expect(lastCall()).toMatchObject({ method: 'GET', url: '/fleet/logout' });
  });

  it('clientConfigApi.getConfig -> GET /client/info with the old query flags', async () => {
    respond({ data: {} });
    await clientConfigApi.getConfig();
    expect(lastCall()).toMatchObject({
      method: 'GET',
      url: '/client/info',
      params: { details: true, login: true, logo: true, clientDetails: true },
    });
  });

  it('setupApi.updateProfile -> PUT /profile { first_name }', async () => {
    await setupApi.updateProfile('Asha');
    expect(lastCall()).toMatchObject({
      method: 'PUT',
      url: '/profile',
      data: { first_name: 'Asha' },
    });
  });

  it('vehiclesApi.getBrands -> GET /vehicle/brand', async () => {
    await vehiclesApi.getBrands();
    expect(lastCall()).toMatchObject({ method: 'GET', url: '/vehicle/brand' });
  });

  it('vehiclesApi.getModels -> GET /vehicle/model/:brandId', async () => {
    await vehiclesApi.getModels('7');
    expect(lastCall()).toMatchObject({ method: 'GET', url: '/vehicle/model/7' });
  });

  it('vehiclesApi.getCapacities -> GET /vehicle/capacity/:modelId', async () => {
    await vehiclesApi.getCapacities('42');
    expect(lastCall()).toMatchObject({ method: 'GET', url: '/vehicle/capacity/42' });
  });

  it('vehiclesApi.addVehicle -> POST /vehicle with the old payload keys', async () => {
    await vehiclesApi.addVehicle({
      model: { id: '42', name: 'Nexon EV' },
      capacity: { kind: 'preset', capacity: { id: '3', kwh: 30, rangeKm: null } },
      details: { regNo: 'ts09ab1234', macId: 'ab12', maxAmount: '500' },
    });
    expect(lastCall()).toMatchObject({
      method: 'POST',
      url: '/vehicle',
      data: { modelId: 42, regNo: 'TS09AB1234', capacityId: 3, vinNumber: 'AB12', maxAmount: 500 },
    });
  });
});
