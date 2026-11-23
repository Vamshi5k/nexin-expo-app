import Constants from 'expo-constants';

/** Raw `extra` from app.config.ts. Only src/core/config reads this. */
export function readExtra(): Record<string, unknown> {
  const extra = Constants.expoConfig?.extra;
  if (!extra) {
    throw new Error('Missing expoConfig.extra. Is app.config.ts being used?');
  }
  return extra;
}
