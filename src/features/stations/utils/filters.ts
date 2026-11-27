import type { StationFilterParams, StationFilters } from '../types/stations.types';

export function toFilterParams(filters: StationFilters): StationFilterParams {
  const params: StationFilterParams = {};

  if (filters.minPowerKw) params.min_power_output = filters.minPowerKw;
  if (filters.access === 'public') params.stationType = 'Public';
  if (filters.access === 'private') params.stationType = 'Private';
  if (filters.connectorTypes.length) params.connectorTypes = filters.connectorTypes.join(',');

  return params;
}

export function countActiveFilters(filters: StationFilters): number {
  let count = 0;

  if (filters.minPowerKw) count += 1;
  if (filters.access !== 'any') count += 1;
  count += filters.connectorTypes.length;

  return count;
}
