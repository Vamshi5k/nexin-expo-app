import type { StationAccess, StationFilters } from '../types/stations.types';

export const NEARBY_LIMIT = 5;

// Wait for the map to stop moving before re-clustering.
export const REGION_SETTLE_MS = 250;

export const CLUSTER_RADIUS_PX = 60;
export const MARKER_TRACK_MS = 500;
export const CLUSTER_MAX_ZOOM = 16;
export const MY_LOCATION_ZOOM_DELTA = 0.01;

export const ERROR_TOAST_COOLDOWN_MS = 3_000;

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
  scan: '/(app)/scan',
} as const;

export const MAP_COPY = {
  searchPlaceholder: 'Search stations',
  filters: 'Filters',
  myLocation: 'Go to my location',
  viewAll: 'View all stations',
  loadError: "Couldn't load charging stations. Please try again.",
  loadErrorShort: "Couldn't load stations",
  retry: 'Retry',
  emptyTitle: 'No stations found here',
  emptyFiltered: 'Try clearing your filters.',
  clearFilters: 'Clear filters',
  locationError: "Couldn't find your location. Please try again.",
  viewDetails: 'View details',
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
