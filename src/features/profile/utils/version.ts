// Not pure: reads the installed app's version from the native module (expo-application), with
// the config version as a fallback for dev builds made before the module was added.
import Constants from 'expo-constants';

import { log } from '@/core/log';

export type AppVersion = { version: string; build: string | null };

export function readAppVersion(): AppVersion {
  const fallback = Constants.expoConfig?.version ?? '0.0.0';

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const app = require('expo-application') as typeof import('expo-application');
    return {
      version: app.nativeApplicationVersion ?? fallback,
      build: app.nativeBuildVersion ?? null,
    };
  } catch (error) {
    log.warn('expo-application unavailable, using config version', { error: String(error) });
    return { version: fallback, build: null };
  }
}
