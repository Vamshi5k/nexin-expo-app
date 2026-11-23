import { create as createAxios, type AxiosInstance } from 'axios';

import { installAuth, type AuthDeps } from './refresh';

export const API_TIMEOUT_MS = 20_000;
export const REFRESH_PATH = '/auth/refresh';

/**
 * TODO(backend): does /auth/refresh also refresh fleet tokens? The old app sends the fleet
 * refresh token here too. Kept behind this constant until confirmed (docs/OPEN_QUESTIONS.md).
 */
export const FLEET_REFRESH_PATH = REFRESH_PATH;

export type ApiClientOptions = Omit<AuthDeps, 'refreshUrl'> & {
  baseURL: string;
  refreshPath?: string;
};

/** axios instance with BLUEPRINT client rules: base URL, 20 s timeout, cookies, auth + refresh. */
export function createApiClient({
  baseURL,
  refreshPath = REFRESH_PATH,
  ...auth
}: ApiClientOptions): AxiosInstance {
  const client = createAxios({ baseURL, timeout: API_TIMEOUT_MS, withCredentials: true });
  installAuth(client, { ...auth, refreshUrl: `${baseURL}${refreshPath}` });
  return client;
}
