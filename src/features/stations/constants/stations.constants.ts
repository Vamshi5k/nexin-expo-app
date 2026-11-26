import type { StationAccess, StationFilters } from '../types/stations.types';

export const NEARBY_LIMIT = 5;

// Wait for the map to stop moving before re-clustering.
export const REGION_SETTLE_MS = 250;

export const CLUSTER_RADIUS_PX = 60;
export const MARKER_TRACK_MS = 500;
export const CLUSTER_MAX_ZOOM = 16;
export const MY_LOCATION_ZOOM_DELTA = 0.01;

export const ERROR_TOAST_COOLDOWN_MS = 3_000;

// Past this a drive-time estimate stops meaning anything.
export const MAX_ETA_KM = 300;

export const POWER_OPTIONS_KW = [7, 22, 50, 120] as const;

export const ACCESS_OPTIONS: { value: StationAccess; label: string }[] = [
  { value: 'any', label: 'Any' },
  { value: 'public', label: 'Public' },
  { value: 'private', label: 'Private' },
];

export const DEFAULT_FILTERS: StationFilters = {
  minPowerKw: null,
  access: 'any',
  connectorTypes: [],
};

export const STATIONS_HREF = {
  list: '/(app)/(tabs)/stations',
  search: { pathname: '/(app)/(tabs)/stations', params: { focus: '1' } },
  scan: '/(app)/scan',
} as const;

// Stations tab. 10 a page: the old app's 5 flashed skeletons on every scroll (OPEN_QUESTIONS #17).
export const STATIONS_PAGE_SIZE = 10;
export const SEARCH_DEBOUNCE_MS = 500;
// Load the next page when the user is within 40% of a screen of the end.
export const LOAD_MORE_THRESHOLD = 0.4;

export const LIST_COPY = {
  title: 'Stations',
  subtitle: 'Nearest charging stations first',
  searchPlaceholder: 'Search stations...',
  clearSearch: 'Clear search',
  locationOffTitle: 'Location is off',
  locationOffBody: 'Turn on location to see charging stations near you.',
  enableLocation: 'Enable location',
  loadError: "Couldn't load stations",
  loadMoreError: "Couldn't load more stations",
  retry: 'Retry',
  noResults: 'No stations found',
  noResultsBody: 'Try searching with a different keyword.',
  clearSearchAction: 'Clear Search',
  emptyTitle: 'No stations available',
  emptyBody: 'Stations will appear here once available.',
  unavailable: 'Unavailable',
  addFavourite: 'Add to favourites',
  removeFavourite: 'Remove from favourites',
  free: (available: number, total: number) => `${available}/${total} Free`,
};

export const MAP_COPY = {
  searchPlaceholder: 'Search stations',
  filters: 'Filters',
  myLocation: 'Go to my location',
  viewAll: 'View all stations',
  loadError: "Couldn't load charging stations. Please try again.",
  loadErrorShort: "Couldn't load stations",
  retry: 'Retry',
  emptyTitle: 'No stations found here',
  emptyFiltered: 'Try clearing your filters',
  clearFilters: 'Clear filters',
  locationError: "Couldn't find your location. Please try again.",
  viewDetails: 'View details',
  nearby: 'Nearby',
  unavailableTitle: "Map isn't available in this build",
  unavailableBuild: 'Install the latest app build to see stations on the map.',
  unavailableKey: 'This build has no Google Maps key. Stations still show below.',
} as const;

export const CARD_COPY = {
  price: '/kWh',
  directions: 'Directions to',
  go: 'Go',
  distance: 'Distance',
  drive: 'Drive',
  perKwh: 'per kWh',
} as const;

export const FILTERS_COPY = {
  title: 'Filters',
  minPower: 'Min. Power',
  anyPower: 'Any',
  access: 'Accessibility',
  connectors: 'Connectors',
  clear: 'Clear',
  apply: 'Apply Filters',
} as const;

export const DETAILS_HREF = {
  chargingSummary: '/(app)/charging-summary',
  home: '/(app)/(tabs)/home',
} as const;

export const DETAILS_COPY = {
  back: 'Back',
  share: 'Share station',
  addFavourite: 'Add to favourites',
  removeFavourite: 'Remove from favourites',
  added: 'Added to favourites',
  removed: 'Removed from favourites',
  directions: 'Get Directions',
  call: 'Call station',
  chargers: 'Chargers',
  tip: 'Tap a connector to start charging',
  amenities: 'Amenities',
  noChargers: 'No chargers listed yet',
  noChargersBody: 'This station has no chargers to show right now.',
  loadError: "Couldn't load this station",
  retry: 'Retry',
  mapsTitle: 'Open directions in',
  appleMaps: 'Apple Maps',
  googleMaps: 'Google Maps',
  shareError: 'Unable to share station details',
  callError: 'Calling is not supported on this device',
  unknownType: 'Unknown type',
  distance: 'Distance',
  drive: 'Drive',
  power: 'Max power',
  perKwh: 'per kWh',
  address: 'Address',
  helpLine: 'Help line',
  connectorTypes: 'Connector types',
  directionsShort: 'Directions',
  chargerCount: 'Chargers',
  connectorCount: 'Connectors',
  connectorType: 'Connector type',
  connectorsFree: 'Connectors free',
  price: 'Price',
  route: 'Route',
  mapPreview: 'Map preview, opens directions',
  copy: 'Copy',
  copied: 'Address copied',
  access: 'Access',
  openingHours: 'Opening hours',
  photo: 'Station photo',
  illustration: 'Electric cars charging at a station',
  free: 'free',
  info: 'Info',
  sections: 'Station sections',
  noInfo: 'No details yet',
  noInfoBody: 'This station has not shared any details yet.',
} as const;

export const DETAILS_TABS = ['chargers', 'info'] as const;
export type DetailsTab = (typeof DETAILS_TABS)[number];

export const chargerTitle = (index: number) => `Charger ${index + 1}`;
export const chargerName = (index: number) => `Charger ${String(index + 1).padStart(2, '0')}`;
export const connectorTitle = (connectorId: string) => `Connector ${connectorId}`;
export const freeBadge = (free: number, total: number) => `${free}/${total} free`;
export const connectorBusy = (status: string) => `Connector is currently ${status}`;

export const pageLabel = (page: number, total: number) => `Photo ${page} of ${total}`;
export const pad2 = (value: number) => String(value).padStart(2, '0');
export const routeLabel = (distance: string, eta: string | null) =>
  eta ? `${distance} · ${eta} drive` : distance;
