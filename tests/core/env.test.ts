// jest.mock is hoisted above imports by babel-jest.
import { buildEnv, env } from '@/core/config';

jest.mock('expo-constants', () => ({
  __esModule: true,
  default: {
    expoConfig: {
      extra: {
        // config.ts also parses the brand at import time
        brand: jest.requireActual('@brand/brand.config').default,
        appEnv: 'staging',
        env: {
          apiHost: 'https://api.example.com/',
          socketUrl: 'https://ws.example.com',
          clientToken: 'abc',
        },
      },
    },
  },
}));

describe('core env', () => {
  it('reads expoConfig.extra and appends the API version', () => {
    expect(env).toEqual({
      APP_ENV: 'staging',
      API_URL: 'https://api.example.com/v1',
      SOCKET_URL: 'https://ws.example.com',
      CLIENT_TOKEN: 'abc',
    });
  });

  it('throws on a malformed extra', () => {
    expect(() => buildEnv({ appEnv: 'qa', env: {} })).toThrow(/Invalid env/);
  });
});
