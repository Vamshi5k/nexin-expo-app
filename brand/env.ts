/**
 * Per-environment backend endpoints for this client.
 *
 * Client tokens identify the tenant to the backend. They are not secret (they ship
 * inside the app), but an EAS env var overrides the value below when set, so a
 * token can be rotated without a commit.
 */

export const APP_ENVS = ['development', 'staging', 'production'] as const;
export type AppEnv = (typeof APP_ENVS)[number];

export type EnvConfig = {
  apiHost: string;
  socketUrl: string;
  clientToken: string;
};

const ENVIRONMENTS: Record<AppEnv, EnvConfig> = {
  // Development uses the staging backend until a stable dev host exists.
  development: {
    apiHost: 'https://testapi.evechos.com',
    socketUrl: 'https://testapi.evechos.com',
    clientToken: 'c10204ae-4300-4c58-a3a6-b9cfbdde10fc',
  },
  staging: {
    apiHost: 'https://testapi.evechos.com',
    socketUrl: 'https://testapi.evechos.com',
    clientToken: 'c10204ae-4300-4c58-a3a6-b9cfbdde10fc',
  },
  production: {
    apiHost: 'https://api.nexinev.com',
    socketUrl: 'https://api.nexinev.com',
    clientToken: 'c7ba30bc-d35c-4596-a9bc-deddf96cd68d',
  },
};

export function isAppEnv(value: unknown): value is AppEnv {
  return typeof value === 'string' && (APP_ENVS as readonly string[]).includes(value);
}

export function resolveAppEnv(raw: string | undefined): AppEnv {
  const value = raw ?? 'development';
  if (!isAppEnv(value)) {
    throw new Error(`Unknown APP_ENV "${value}". Expected one of: ${APP_ENVS.join(', ')}`);
  }
  return value;
}

/** Endpoints for `appEnv`, with optional overrides from the build environment. */
export function resolveEnv(
  appEnv: AppEnv,
  overrides: { API_HOST?: string; SOCKET_URL?: string; CLIENT_TOKEN?: string } = {},
): EnvConfig {
  const base = ENVIRONMENTS[appEnv];
  return {
    apiHost: (overrides.API_HOST || base.apiHost).replace(/\/+$/, ''),
    socketUrl: (overrides.SOCKET_URL || base.socketUrl).replace(/\/+$/, ''),
    clientToken: overrides.CLIENT_TOKEN || base.clientToken,
  };
}
