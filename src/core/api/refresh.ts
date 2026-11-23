import {
  AxiosHeaders,
  create as createAxios,
  type AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from 'axios';

import { log } from '@/core/log';

export type Tokens = { accessToken: string; refreshToken: string };

export type AuthDeps = {
  clientToken: string;
  /** Absolute URL of POST /auth/refresh. */
  refreshUrl: string;
  getAccessToken: () => string | null;
  getRefreshToken: () => string | null;
  saveTokens: (tokens: Tokens) => void | Promise<void>;
  /** Called when the server rejects the refresh token (4xx). */
  onSessionExpired: () => void | Promise<void>;
  /** Plain client for the refresh call (no interceptors). Injected in tests. */
  refreshClient?: AxiosInstance;
};

type RetryConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
  /** Access token this request was sent with. */
  _sentToken?: string | null;
};

function readTokens(body: unknown): Tokens | null {
  const pick = (o: unknown): Tokens | null => {
    if (!o || typeof o !== 'object') return null;
    const r = o as Record<string, unknown>;
    const accessToken = r.accessToken ?? r.userAccessToken;
    const refreshToken = r.refreshToken ?? r.userRefreshToken;
    return typeof accessToken === 'string' && typeof refreshToken === 'string'
      ? { accessToken, refreshToken }
      : null;
  };
  return pick(body) ?? pick((body as { data?: unknown } | null)?.data);
}

function setAuthHeader(config: InternalAxiosRequestConfig, token: string | null) {
  const headers = AxiosHeaders.from(config.headers);
  if (token) headers.set('Authorization', `Bearer ${token}`);
  else headers.delete('Authorization');
  config.headers = headers;
}

/**
 * Adds auth headers and the 401 refresh flow (BLUEPRINT "HTTP client rules"):
 * concurrent 401s share ONE POST /auth/refresh, then replay. Refresh 4xx -> session expired;
 * network/5xx -> keep the session and fail the request.
 */
export function installAuth(client: AxiosInstance, deps: AuthDeps): void {
  const refreshClient =
    deps.refreshClient ?? createAxios({ timeout: 20_000, withCredentials: true });
  let refreshing: Promise<string> | null = null;

  async function refresh(): Promise<string> {
    const refreshToken = deps.getRefreshToken();
    if (!refreshToken) throw new Error('No refresh token');
    try {
      const res = await refreshClient.post(
        deps.refreshUrl,
        { refreshToken },
        { headers: { 'x-client-token': deps.clientToken } },
      );
      const tokens = readTokens(res.data);
      if (!tokens) throw new Error('Refresh response had no tokens');
      await deps.saveTokens(tokens);
      return tokens.accessToken;
    } catch (error) {
      const status = (error as AxiosError).response?.status;
      if (status !== undefined && status >= 400 && status < 500) {
        log.warn('refresh rejected; ending session', { status });
        await deps.onSessionExpired();
      } else {
        log.warn('refresh failed; keeping session', { status });
      }
      throw error;
    }
  }

  client.interceptors.request.use((config: RetryConfig) => {
    const token = deps.getAccessToken();
    config._sentToken = token;
    setAuthHeader(config, token);
    const headers = AxiosHeaders.from(config.headers);
    headers.set('x-client-token', deps.clientToken);
    config.headers = headers;
    return config;
  });

  client.interceptors.response.use(undefined, async (error: AxiosError) => {
    const config = error.config as RetryConfig | undefined;
    if (!config || error.response?.status !== 401 || config._retry || !deps.getRefreshToken()) {
      throw error;
    }
    config._retry = true;

    // Another request already refreshed after this one was sent: just replay.
    const current = deps.getAccessToken();
    if (current && current !== config._sentToken && !refreshing) {
      return client.request(config);
    }

    if (!refreshing) {
      refreshing = refresh().finally(() => {
        refreshing = null;
      });
    }
    try {
      await refreshing;
    } catch {
      throw error;
    }
    return client.request(config);
  });
}
