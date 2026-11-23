/**
 * Storage keys (BLUEPRINT "Local storage keys to keep"). Names match the old app so the
 * legacy migration can find them.
 */
export const SECURE_KEYS = {
  accessToken: 'access_token',
  refreshToken: 'refresh_token',
  fleetToken: 'fleetToken',
  fleetRefreshToken: 'fleetRefreshToken',
} as const;
export type SecureKey = (typeof SECURE_KEYS)[keyof typeof SECURE_KEYS];

export const KV_KEYS = {
  clientConfig: 'CLIENT_CONFIG',
  firstLogin: 'firstlogin',
  fcmToken: 'FCM_TOKEN',
  /** Set once the AsyncStorage -> SecureStore/MMKV migration has completed. */
  legacyMigrated: 'legacy_migrated_v1',
} as const;
export type KvKey = (typeof KV_KEYS)[keyof typeof KV_KEYS];
