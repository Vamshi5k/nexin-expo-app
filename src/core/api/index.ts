import { env } from '@/core/config';
import { sessionStore } from '@/core/session';

import { createApiClient } from './client';

/** The app's API client. Tokens come from the active session; refresh 4xx signs out. */
export const api = createApiClient({
  baseURL: env.API_URL,
  clientToken: env.CLIENT_TOKEN,
  getAccessToken: () => sessionStore.getState().tokens?.accessToken ?? null,
  getRefreshToken: () => sessionStore.getState().tokens?.refreshToken ?? null,
  saveTokens: (tokens) => sessionStore.getState().updateTokens(tokens),
  onSessionExpired: () => sessionStore.getState().signOut(),
});

export { createApiClient, API_TIMEOUT_MS, REFRESH_PATH, FLEET_REFRESH_PATH } from './client';
export { unwrap, toPage, nextPage, type Envelope, type Page, type Pagination } from './envelope';
export { ApiError, getErrorMessage, toApiError, statusOf, type ApiErrorKind } from './errors';
export type { Tokens } from './refresh';
