/**
 * Gives tests the same expoConfig.extra the app gets from app.config.ts
 * (resolved brand + development env). Individual tests may jest.mock it again.
 */
jest.mock('expo-constants', () => {
  const { default: brandConfig } = jest.requireActual('./brand/brand.config');
  const { resolveEnv } = jest.requireActual('./brand/env');
  const { parseBrand } = jest.requireActual('./brand/schema');
  return {
    __esModule: true,
    default: {
      expoConfig: {
        extra: {
          appEnv: 'development',
          env: resolveEnv('development'),
          brand: parseBrand(brandConfig),
        },
      },
    },
  };
});

jest.mock('@react-native-async-storage/async-storage', () =>
  jest.requireActual('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

/** In-memory MMKV: the real package loads Nitro native modules that Jest can't run. */
jest.mock('react-native-mmkv', () => ({
  createMMKV: () => {
    const map = new Map<string, string | number | boolean>();
    return {
      set: (k: string, v: string | number | boolean) => void map.set(k, v),
      getString: (k: string) => {
        const v = map.get(k);
        return typeof v === 'string' ? v : undefined;
      },
      getBoolean: (k: string) => {
        const v = map.get(k);
        return typeof v === 'boolean' ? v : undefined;
      },
      getNumber: (k: string) => {
        const v = map.get(k);
        return typeof v === 'number' ? v : undefined;
      },
      contains: (k: string) => map.has(k),
      remove: (k: string) => map.delete(k),
      clearAll: () => map.clear(),
      getAllKeys: () => [...map.keys()],
    };
  },
}));

// Feature hooks only take toast and haptics from the UI kit; the real index loads Reanimated,
// which can't start under Jest. Tests that need real UI code import the file directly.
jest.mock('@/ui', () => ({
  toast: { success: jest.fn(), error: jest.fn(), info: jest.fn() },
  haptics: { selection: jest.fn(), light: jest.fn(), success: jest.fn(), warning: jest.fn(), error: jest.fn() },
}));
