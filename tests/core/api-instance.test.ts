import type { InternalAxiosRequestConfig } from 'axios';

import { sessionStore } from '@/core/session';

import { api } from '@/core/api';

jest.mock('@/core/log');
jest.mock('@/core/storage', () => {
  const map = new Map<string, string>();
  return {
    ...jest.requireActual('@/core/storage'),
    secure: {
      get: async (k: string) => map.get(k) ?? null,
      set: async (k: string, v: string) => void map.set(k, v),
      remove: async (k: string) => void map.delete(k),
    },
  };
});

describe('app api instance', () => {
  it('uses the active session token and the brand client token', async () => {
    await sessionStore.getState().signIn('consumer', { accessToken: 'tok', refreshToken: 'ref' });
    let seen: InternalAxiosRequestConfig | undefined;
    api.defaults.adapter = async (config) => {
      seen = config;
      return { config, status: 200, statusText: 'OK', headers: {}, data: { data: 1 } };
    };
    await api.get('/ping');
    expect(seen?.headers.get('Authorization')).toBe('Bearer tok');
    expect(seen?.headers.get('x-client-token')).toBeTruthy();
    expect(seen?.baseURL).toMatch(/\/v1$/);
  });
});
