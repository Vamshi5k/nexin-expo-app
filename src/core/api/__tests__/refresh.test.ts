import {
  AxiosError,
  create as createAxios,
  type AxiosAdapter,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';

import { createApiClient } from '../client';

jest.mock('@/core/log');

function response(
  config: InternalAxiosRequestConfig,
  status: number,
  data: unknown,
): AxiosResponse {
  return { config, status, statusText: String(status), headers: {}, data };
}

function fail(config: InternalAxiosRequestConfig, status: number): never {
  const res = response(config, status, { message: `HTTP ${status}` });
  throw new AxiosError(`HTTP ${status}`, String(status), config, null, res);
}

function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((r) => (resolve = r));
  return { promise, resolve };
}

/** API server: accepts only the current valid token; records every request's headers. */
function setup(opts: {
  refreshAdapter: AxiosAdapter;
  serverDelay?: (url?: string) => Promise<void>;
}) {
  let access: string | null = 'old-access';
  let refreshToken: string | null = 'old-refresh';
  const seen: { url?: string; auth?: string; clientToken?: string }[] = [];
  const onSessionExpired = jest.fn(() => {
    access = null;
    refreshToken = null;
  });

  const client = createApiClient({
    baseURL: 'https://api.test/v1',
    clientToken: 'tenant-1',
    getAccessToken: () => access,
    getRefreshToken: () => refreshToken,
    saveTokens: (t) => {
      access = t.accessToken;
      refreshToken = t.refreshToken;
    },
    onSessionExpired,
    refreshClient: createAxios({ adapter: opts.refreshAdapter }),
  });

  client.defaults.adapter = async (config) => {
    const auth = String(config.headers.get('Authorization') ?? '');
    seen.push({ url: config.url, auth, clientToken: String(config.headers.get('x-client-token')) });
    await opts.serverDelay?.(config.url);
    if (auth !== 'Bearer new-access') fail(config, 401);
    return response(config, 200, { data: { url: config.url } });
  };

  return { client, seen, onSessionExpired, tokens: () => ({ access, refreshToken }) };
}

describe('401 refresh queue', () => {
  it('3 concurrent 401s cause exactly 1 refresh call, then all replay with the new token', async () => {
    const gate = deferred();
    const refreshAdapter = jest.fn<ReturnType<AxiosAdapter>, Parameters<AxiosAdapter>>(
      async (config) => {
        await gate.promise; // hold the refresh until all three 401s are in
        return response(config, 200, { accessToken: 'new-access', refreshToken: 'new-refresh' });
      },
    );
    const { client, seen, tokens } = setup({ refreshAdapter });

    const calls = Promise.all(['/a', '/b', '/c'].map((u) => client.get(u)));
    await new Promise((r) => setTimeout(r, 10));
    expect(seen.filter((s) => s.auth === 'Bearer old-access')).toHaveLength(3);
    gate.resolve();

    const results = await calls;
    expect(refreshAdapter).toHaveBeenCalledTimes(1);
    expect(results.map((r) => r.data.data.url)).toEqual(['/a', '/b', '/c']);
    expect(tokens()).toEqual({ access: 'new-access', refreshToken: 'new-refresh' });

    const refreshCall = refreshAdapter.mock.calls[0][0];
    expect(refreshCall.url).toBe('https://api.test/v1/auth/refresh');
    expect(JSON.parse(refreshCall.data as string)).toEqual({ refreshToken: 'old-refresh' });
    expect(refreshCall.headers.get('x-client-token')).toBe('tenant-1');
  });

  it('a late 401 for an already-replaced token replays without a second refresh', async () => {
    const lateB = deferred();
    const refreshAdapter = jest.fn<ReturnType<AxiosAdapter>, Parameters<AxiosAdapter>>(
      async (config) =>
        response(config, 200, { accessToken: 'new-access', refreshToken: 'new-refresh' }),
    );
    const { client } = setup({
      refreshAdapter,
      serverDelay: async (url) => {
        if (url === '/b') await lateB.promise;
      },
    });

    const b = client.get('/b'); // sent with old token, answers late
    await client.get('/a'); // 401 -> refresh -> replay succeeds
    lateB.resolve();
    await b;
    expect(refreshAdapter).toHaveBeenCalledTimes(1);
  });

  it('refresh 4xx ends the session and rejects with the original 401', async () => {
    const refreshAdapter: AxiosAdapter = async (config) => fail(config, 401);
    const { client, onSessionExpired } = setup({ refreshAdapter });
    await expect(client.get('/a')).rejects.toMatchObject({ response: { status: 401 } });
    expect(onSessionExpired).toHaveBeenCalledTimes(1);
  });

  it('refresh 5xx or network failure keeps the session', async () => {
    const refreshAdapter: AxiosAdapter = async (config) => fail(config, 503);
    const { client, onSessionExpired, tokens } = setup({ refreshAdapter });
    await expect(client.get('/a')).rejects.toMatchObject({ response: { status: 401 } });
    expect(onSessionExpired).not.toHaveBeenCalled();
    expect(tokens().refreshToken).toBe('old-refresh');
  });

  it('sends x-client-token and the bearer token on every request', async () => {
    const refreshAdapter: AxiosAdapter = async (config) =>
      response(config, 200, { accessToken: 'new-access', refreshToken: 'new-refresh' });
    const { client, seen } = setup({ refreshAdapter });
    await client.get('/a');
    expect(seen.every((s) => s.clientToken === 'tenant-1')).toBe(true);
    expect(seen.map((s) => s.auth)).toEqual(['Bearer old-access', 'Bearer new-access']);
  });
});
