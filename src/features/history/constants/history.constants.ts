import type { HistoryTab, SessionStatus } from '../types/history.types';

export const HISTORY_HREF = {
  list: '/(app)/charging/history',
  profile: '/(app)/(tabs)/profile',
} as const;

export const HISTORY_TABS: HistoryTab[] = ['all', 'completed', 'active'];

export const HISTORY_COPY = {
  title: 'Charging History',
  subtitle: (n: number) => (n === 1 ? '1 session' : `${n} sessions`),
  subtitleEmpty: 'Every charge you make shows up here',
  tabs: { all: 'All', completed: 'Completed', active: 'Active' } satisfies Record<
    HistoryTab,
    string
  >,
  tabsLabel: 'Filter sessions',
  emptyTitle: 'No charging sessions yet',
  emptyBody: 'Your charging sessions will appear here.',
  emptyFiltered: {
    completed: 'No completed sessions yet',
    active: 'No active sessions right now',
  },
  loadError: "Couldn't load your charging history",
  retry: 'Retry',
  connector: (id: string) => `C${id}`,
  power: (kw: number, type: string | null) => (type ? `${kw} kW ${type}` : `${kw} kW`),
  unknownStation: 'Charging station',
  open: 'Opens the invoice',
} as const;

export const STATUS_COPY: Record<SessionStatus, string> = {
  completed: 'Completed',
  active: 'In progress',
  failed: 'Failed',
};

export const INVOICE_COPY = {
  title: 'Invoice',
  subtitle: 'Your charging receipt',
  totalPaid: 'Total paid',
  sessionId: 'Session ID',
  session: 'Session',
  dateTime: 'Date & time',
  energy: 'Energy used',
  duration: 'Charging time',
  battery: 'Battery',
  soc: (start: number, stop: number) => `${start}% → ${stop}%`,
  chargerType: 'Charger type',
  connector: 'Connector',
  chargerId: 'Charger ID',
  location: 'Location',
  address: 'Address',
  vehicle: 'Vehicle',
  helpLine: 'Help line',
  billing: 'Billing',
  energyCharge: 'Energy charge',
  rate: 'Price per unit',
  ratePerKwh: (rate: string) => `${rate}/kWh`,
  sgst: (percent: string) => `SGST (${percent}%)`,
  cgst: (percent: string) => `CGST (${percent}%)`,
  tax: 'Tax',
  total: 'Total amount',
  download: 'Download Invoice',
  downloading: 'Preparing invoice…',
  downloaded: 'Invoice saved',
  downloadError: "Couldn't download the invoice. Please try again.",
  needsUpdate: 'Update the app to download invoices',
  pdfTitle: 'Charging invoice',
  activeNote: 'This session is still charging. The invoice is ready once it ends.',
  loadError: "Couldn't load this invoice",
  retry: 'Retry',
} as const;
