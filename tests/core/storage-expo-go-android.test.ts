jest.mock('@/core/log');
jest.mock('expo-constants', () => ({
  __esModule: true,
  default: { executionEnvironment: 'bare' },
}));
jest.mock('expo', () => ({ ...jest.requireActual('expo'), isRunningInExpoGo: () => true }));
jest.mock('react-native-mmkv', () => {
  throw new Error('MMKV must not load in Expo Go');
});

it('detects Android Expo Go even when Constants report "bare"', () => {
  const storage = require('@/core/storage');
  expect(storage.isExpoGo).toBe(true);
});
