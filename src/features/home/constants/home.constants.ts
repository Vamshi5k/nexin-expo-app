export const TAB_LABELS = {
  map: 'Map',
  stations: 'Stations',
  scan: 'Scan',
  wallet: 'Wallet',
  profile: 'Profile',
} as const;

export const SCAN_HREF = '/(app)/scan';

// The tab route behind the Scan button; it never opens.
export const SCAN_ROUTE = 'scanner';

export const PLACEHOLDER_COPY = {
  stations: 'Search and browse every charging station here.',
  scan: 'Scan the QR code on a charger to start charging.',
  chargingSummary: 'Pick an amount and start charging here.',
} as const;
