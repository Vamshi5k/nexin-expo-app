import type { AppEnv } from '@brand/env';

/** Dev-only screens (UI gallery) exist in development and staging builds only. */
export function isDevToolsEnabled(appEnv: AppEnv): boolean {
  return appEnv !== 'production';
}
