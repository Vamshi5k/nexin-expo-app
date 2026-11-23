/**
 * Client brand values. In a client repo this file, env.ts, map-style.json and
 * assets/ are the ONLY things that change. Run `npm run brand:check` after editing.
 */
import type { BrandConfigInput } from './schema';

const brandConfig = {
  appName: 'Cruze EV',
  slug: 'cruze-ev',
  scheme: 'cruzeev',
  bundleId: 'com.cruzeev.app',
  androidPackage: 'com.cruzeev.app',
  webDomain: 'cruzeev.com',
  deepLinkDomains: ['cruzeev.com'],
  deleteAccountUrl: 'https://www.cruzeev.in/delete-account',

  colors: {
    primary: '#00C8D0',
    primaryLight: '#E6F8FA',
    primaryDark: '#1A8F99',
    background: '#F4FBFC',
    surface: '#FFFFFF',
    textPrimary: '#0E2E31',
    textSecondary: '#4A6A6E',
    textTertiary: '#7D9B9F',
    border: '#C2EBEE',
    borderLight: '#E6F8FA',
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#D32F2F',
  },
  connectorColors: {
    Available: '#16A34A',
    Charging: '#0DD5E3',
    Unavailable: '#EF4444',
    Faulted: '#FFC107',
    Reserved: '#F59E0B',
    Unknown: '#9E9E9E',
  },

  // Light only until dark colour tokens exist (the old app had no dark theme).
  appearance: 'light',
  adaptiveIcon: { backgroundColor: '#FFFFFF' },
  splash: { imageWidth: 200, backgroundColor: '#FFFFFF' },

  fontFamily: 'Inter',
  locale: 'en-IN',
  currency: { code: 'INR', symbol: '₹' },
  phoneRegex: '^[6-9]\\d{9}$',
  phoneLength: 10,
  taxModel: 'GST_SPLIT',

  minTopUp: 100,
  quickTopUpAmounts: [100, 200, 500, 1000],
  quickChargeAmounts: [100, 200, 500, 1000],
  quickChargeKwh: [5, 10, 20, 30],

  defaultRegion: { lat: 17.4239, lng: 78.3772, latDelta: 0.05, lngDelta: 0.05 },

  features: { fleet: false, coupons: false },

  // Fill in after `eas init` for this client's Expo project.
  // easProjectId: '00000000-0000-0000-0000-000000000000',
  // owner: 'expo-account-name',
} satisfies BrandConfigInput;

export default brandConfig;
