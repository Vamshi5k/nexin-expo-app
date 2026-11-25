import type { InternalAxiosRequestConfig } from 'axios';

import { resolveEnv, type AppEnv } from '@brand/env';

import { api } from '@/core/api';
import { buildEnv } from '@/core/config';
import { clientConfigApi } from '@/features/client-config/api/clientConfig.api';

// Old app: API_URL = `${API_HOST}/v1` (src/constants/env.ts).

const apiUrlFor = (appEnv: AppEnv, overrides?: { API_HOST?: string }) =>
  buildEnv({ appEnv, env: { ...resolveEnv(appEnv, overrides), clientToken: 't' } }).API_URL;

describe('API base URL', () => {
  it.each<[AppEnv, string]>([
    ['development', 'https://testapi.evechos.com/v1'],
    ['staging', 'https://testapi.evechos.com/v1'],
    ['production', 'https://api.nexinev.com/v1'],
  ])('%s -> %s', (appEnv, url) => {
    expect(apiUrlFor(appEnv)).toBe(url);
  });

  it('an API_HOST override with a trailing slash still ends in a single /v1', () => {
    expect(apiUrlFor('production', { API_HOST: 'https://api.example.com/' })).toBe(
      'https://api.example.com/v1',
    );
  });

  it('client info is requested under /v1 with the old query flags', async () => {
    const original = api.defaults.adapter;
    let sent: InternalAxiosRequestConfig | undefined;
    api.defaults.adapter = async config => {
      sent = config;
      return { config, status: 200, statusText: 'OK', headers: {}, data: { data: {} } };
    };

    await clientConfigApi.getConfig();
    api.defaults.adapter = original;

    expect(api.getUri(sent)).toBe(
      'https://testapi.evechos.com/v1/client/info?details=true&login=true&logo=true&clientDetails=true',
    );
  });
});
