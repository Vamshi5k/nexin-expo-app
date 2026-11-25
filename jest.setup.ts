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

// Render tests: jest-expo loads Reanimated's native initializer, which calls a CSS API its JS
// fallback throws on. Stub just that initializer, then use the official worklets/Reanimated mocks.
jest.mock('react-native-worklets', () => jest.requireActual('react-native-worklets/src/mock'));
jest.mock('react-native-reanimated/src/initializers', () => ({
  initializeReanimatedModule: () => undefined,
}));
jest.mock('react-native-reanimated', () => jest.requireActual('react-native-reanimated/mock'));

// sonner-native ships ESM only. Tests assert on these spies instead of rendering toasts.
jest.mock('@/shared/utils/toast', () => ({
  toast: { success: jest.fn(), error: jest.fn(), info: jest.fn(), promise: jest.fn() },
  AppToaster: () => null,
}));

// react-native-maps needs native views. MapView renders its markers as plain views and exposes
// the imperative calls the app uses as spies; Marker is a pressable view.
jest.mock('react-native-maps', () => {
  const React = jest.requireActual('react');
  const { View } = jest.requireActual('react-native');

  const MapView = React.forwardRef(
    ({ children, ...props }: { children?: unknown }, ref: unknown) => {
      React.useImperativeHandle(ref, () => ({
        animateToRegion: jest.fn(),
        animateCamera: jest.fn(),
        fitToCoordinates: jest.fn(),
      }));
      return React.createElement(View, props, children);
    },
  );
  const Marker = ({ children, ...props }: { children?: unknown }) =>
    React.createElement(View, { accessibilityRole: 'button', ...props }, children);

  return { __esModule: true, default: MapView, Marker, PROVIDER_GOOGLE: 'google' };
});
