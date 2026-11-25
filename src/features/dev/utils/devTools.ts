import type { AppEnv } from '@brand/env';

export const isDevToolsEnabled = (appEnv: AppEnv): boolean => appEnv !== 'production';
