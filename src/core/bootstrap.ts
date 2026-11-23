import { log } from '@/core/log';
import { sessionStore } from '@/core/session';
import { migrateLegacyStorage } from '@/core/storage';

/**
 * Startup work done while the splash screen is held:
 * 1. move the old app's AsyncStorage values (must run before hydrate so its tokens are found),
 * 2. hydrate the session from SecureStore.
 * Never throws: a failure here must not leave the app stuck on the splash.
 */
export async function bootstrap(): Promise<void> {
  try {
    await migrateLegacyStorage();
  } catch (error) {
    log.warn('legacy migration threw', { error: String(error) });
  }
  await sessionStore.getState().hydrate();
}
