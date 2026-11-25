import Constants from 'expo-constants';
import { z } from 'zod';

import { APP_ENVS, type AppEnv } from '@brand/env';
import brandMapStyle from '@brand/map-style.json';
import { parseBrand, type BrandConfig } from '@brand/schema';

export function readExtra(): Record<string, unknown> {
  const extra = Constants.expoConfig?.extra;
  if (!extra) {
    throw new Error('Missing expoConfig.extra. Is app.config.ts being used?');
  }
  return extra;
}

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

export const brand: BrandConfig = parseBrand(readExtra().brand);

export const phonePattern = new RegExp(brand.phoneRegex);

export const mapStyle = brandMapStyle;

const MapsExtraSchema = z.object({ googleOnIos: z.boolean() }).catch({ googleOnIos: false });

// Google Maps on iOS needs its own key; without it iOS uses Apple Maps (no custom style).
export const googleMapsOnIos = MapsExtraSchema.parse(readExtra().maps).googleOnIos;

export type { BrandConfig, ConnectorStatus } from '@brand/schema';
