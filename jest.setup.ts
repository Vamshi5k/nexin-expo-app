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
