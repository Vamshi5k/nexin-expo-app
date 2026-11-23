import { z } from 'zod';

import { APP_ENVS, type AppEnv } from '@brand/env';

import { readExtra } from './extra';

const API_VERSION = 'v1';

const ExtraEnvSchema = z.object({
  appEnv: z.enum(APP_ENVS),
  env: z.object({
    apiHost: z.url(),
    socketUrl: z.url(),
    clientToken: z.string().min(1),
  }),
});

export type Env = {
  APP_ENV: AppEnv;
  API_URL: string;
  SOCKET_URL: string;
  CLIENT_TOKEN: string;
};

export function buildEnv(extra: unknown): Env {
  const result = ExtraEnvSchema.safeParse(extra);
  if (!result.success) {
    throw new Error(`Invalid env in expoConfig.extra:\n${z.prettifyError(result.error)}`);
  }
  const { appEnv, env } = result.data;
  return {
    APP_ENV: appEnv,
    API_URL: `${env.apiHost.replace(/\/+$/, '')}/${API_VERSION}`,
    SOCKET_URL: env.socketUrl,
    CLIENT_TOKEN: env.clientToken,
  };
}

export const env: Env = buildEnv(readExtra());
export const { APP_ENV, API_URL, SOCKET_URL, CLIENT_TOKEN } = env;
