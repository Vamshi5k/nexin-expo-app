import type { AppEnv } from '@brand/env';

export function isDevToolsEnabled(appEnv: AppEnv): boolean {
  return appEnv !== 'production';
}
