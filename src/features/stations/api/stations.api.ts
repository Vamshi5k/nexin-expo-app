import { api, unwrap, type Envelope } from '@/core/api';
import { ENDPOINTS } from '@/core/endpoints';
import { rupeesToPaise } from '@/shared/utils/money';

import type {
  Coordinates,
  NearbyStation,
  NearbyStationDto,
  StationFilters,
  StationPin,
  StationPinDto,
} from '../types/stations.types';
import { toFilterParams } from '../utils/filters';
import { toStationStatus } from '../utils/status';

type NumberLike = number | string | null | undefined;

const toNumber = (value: NumberLike): number | null => {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

const joinAddress = (...parts: (string | null | undefined)[]) =>
  parts
    .map(part => part?.trim())
    .filter(Boolean)
    .join(', ');

const splitList = (value: string | null | undefined) =>
  (value ?? '')
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);

export const toStationPin = (dto: StationPinDto): StationPin | null => {
  const latitude = toNumber(dto.stationLocation?.latitude);
  const longitude = toNumber(dto.stationLocation?.longitude);
  if (latitude === null || longitude === null) return null;

  return {
    id: String(dto.id),
    name: dto.name?.trim() || '—',
    latitude,
    longitude,
    status: toStationStatus(dto.status ?? dto.stationStatus),
  };
};

export const toNearbyStation = (dto: NearbyStationDto): NearbyStation | null => {
  const location = dto.stationLocation;
  const latitude = toNumber(location?.latitude);
  const longitude = toNumber(location?.longitude);
  if (latitude === null || longitude === null) return null;

  const price = toNumber(dto.minStartingPrice);

  return {
    id: String(dto.id),
    name: dto.name?.trim() || '—',
    address: joinAddress(location?.address, location?.city),
    latitude,
    longitude,
    distanceKm: toNumber(dto.distance),
    availableConnectors: toNumber(dto.availableConnectors),
    totalConnectors: toNumber(dto.totalConnectors),
    connectorTypes: splitList(dto.connectorTypes),
    maxPowerKw: toNumber(dto.maxPowerOutput),
    pricePerKwhPaise: price === null ? null : rupeesToPaise(price),
    status: toStationStatus(dto.status ?? dto.stationStatus),
  };
};

const isPresent = <T>(value: T | null): value is T => value !== null;

export const stationsApi = {
  // TODO(backend): accept map bounds so we stop loading every station at once.
  getLocations: async (filters: StationFilters): Promise<StationPin[]> => {
    const res = await api.get<Envelope<StationPinDto[] | null>>(ENDPOINTS.STATIONS.LOCATIONS, {
      params: toFilterParams(filters),
    });
    return (unwrap(res) ?? []).map(toStationPin).filter(isPresent);
  },

  getNearby: async (
    center: Coordinates,
    filters: StationFilters,
    limit: number,
  ): Promise<NearbyStation[]> => {
    const res = await api.get<Envelope<NearbyStationDto[] | null>>(ENDPOINTS.STATIONS.LIST, {
      params: {
        latitude: center.latitude,
        longitude: center.longitude,
        limit,
        page: 1,
        ...toFilterParams(filters),
      },
    });
    return (unwrap(res) ?? []).map(toNearbyStation).filter(isPresent);
  },
};
