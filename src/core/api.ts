import {
  isAxiosError,
  type AxiosResponse,
  AxiosHeaders,
  create as createAxios,
  type AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from 'axios';

import { env } from '@/core/config';
import { log } from '@/core/log';
import { sessionStore } from '@/core/session';

export type ApiErrorKind = 'http' | 'network' | 'timeout' | 'unknown';

export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status?: number;
  readonly data?: unknown;

  constructor(message: string, kind: ApiErrorKind, status?: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.kind = kind;
    this.status = status;
    this.data = data;
  }

  get isClientError(): boolean {
    return this.status !== undefined && this.status >= 400 && this.status < 500;
  }
}

function messageFromData(data: unknown): string | undefined {
  if (data && typeof data === 'object' && 'message' in data) {
    const m = (data as { message?: unknown }).message;
    if (typeof m === 'string' && m.trim()) return m;
  }
  return undefined;
}

export function getErrorMessage(
  error: unknown,
  fallback = 'Something went wrong. Please try again.',
): string {
  if (isAxiosError(error)) {
    return messageFromData(error.response?.data) || error.message || fallback;
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;
  if (isAxiosError(error)) {
    const message = getErrorMessage(error);
    if (error.response)
      return new ApiError(message, 'http', error.response.status, error.response.data);
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT')
      return new ApiError(message, 'timeout');
    return new ApiError(message, 'network');
  }
  return new ApiError(getErrorMessage(error), 'unknown');
}

export function statusOf(error: unknown): number | undefined {
  if (error instanceof ApiError) return error.status;
  if (isAxiosError(error)) return error.response?.status;
  return undefined;
}

export type Envelope<T> = {
  success?: boolean;
  message?: string;
  data: T;
  pagination?: Pagination;
};

export type Pagination = {
  currentPage?: number;
  page?: number;
  totalPages?: number;
  total?: number;
  limit?: number;
};

export type Page<T> = { items: T[]; page: number; totalPages: number };

export function unwrap<T>(res: AxiosResponse<Envelope<T>>): T {
  return res.data.data;
}

export function toPage<T>(res: AxiosResponse<Envelope<T[] | null | undefined>>): Page<T> {
  const p = res.data.pagination;
  return {
    items: res.data.data ?? [],
    page: p?.currentPage ?? p?.page ?? 1,
    totalPages: p?.totalPages ?? 1,
  };
}

export function nextPage<T>(page: Page<T>): number | undefined {
  return page.page < page.totalPages ? page.page + 1 : undefined;
}

export type Tokens = { accessToken: string; refreshToken: string };

export type AuthDeps = {
  clientToken: string;
  refreshUrl: string;
  getAccessToken: () => string | null;
  getRefreshToken: () => string | null;
  saveTokens: (tokens: Tokens) => void | Promise<void>;
  onSessionExpired: () => void | Promise<void>;
  refreshClient?: AxiosInstance;
};

type RetryConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
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

export const API_TIMEOUT_MS = 20_000;
export const REFRESH_PATH = '/auth/refresh';

// TODO(backend): confirm /auth/refresh also refreshes fleet tokens (OPEN_QUESTIONS #8).
export const FLEET_REFRESH_PATH = REFRESH_PATH;

export type ApiClientOptions = Omit<AuthDeps, 'refreshUrl'> & {
  baseURL: string;
  refreshPath?: string;
};

export function createApiClient({
  baseURL,
  refreshPath = REFRESH_PATH,
  ...auth
}: ApiClientOptions): AxiosInstance {
  const client = createAxios({ baseURL, timeout: API_TIMEOUT_MS, withCredentials: true });
  installAuth(client, { ...auth, refreshUrl: `${baseURL}${refreshPath}` });
  return client;
}

export const api = createApiClient({
  baseURL: env.API_URL,
  clientToken: env.CLIENT_TOKEN,
  getAccessToken: () => sessionStore.getState().tokens?.accessToken ?? null,
  getRefreshToken: () => sessionStore.getState().tokens?.refreshToken ?? null,
  saveTokens: (tokens) => sessionStore.getState().updateTokens(tokens),
  onSessionExpired: () => sessionStore.getState().signOut(),
});
