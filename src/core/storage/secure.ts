import * as SecureStore from 'expo-secure-store';

import type { SecureKey } from './keys';

/** Tokens only. Values are encrypted by the OS keychain / keystore. */
export const secure = {
  get: (key: SecureKey): Promise<string | null> => SecureStore.getItemAsync(key),
  set: (key: SecureKey, value: string): Promise<void> => SecureStore.setItemAsync(key, value),
  remove: (key: SecureKey): Promise<void> => SecureStore.deleteItemAsync(key),
};

export type SecureStorage = typeof secure;
