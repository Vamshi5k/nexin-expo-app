import { api, unwrap, type Envelope } from '@/core/api';
import { ENDPOINTS } from '@/core/endpoints';
import { rupeesToPaise } from '@/shared/utils/money';

import type {
  Charger,
  Connector,
  Coordinates,
  FavouriteDto,
  NearbyStation,
  NearbyStationDto,
  StationDetails,
  StationDetailsDto,
  StationFilters,
  StationPin,
  StationPinDto,
  StationSearchQuery,
} from '../types/stations.types';
import { toConnectorStatus } from '../utils/connector';
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

type ChargerDto = NonNullable<StationDetailsDto['chargers']>[number];
type ConnectorDto = NonNullable<ChargerDto['connectors']>[number];

const text = (value: string | null | undefined) => value?.trim() || null;

// Only http(s) links can be images; anything else would render as an empty box.
const webUrl = (value: string | null | undefined) => {
  const url = text(value);
  return url && /^https?:\/\/\S+$/i.test(url) ? url : null;
};

const toConnector = (dto: ConnectorDto, index: number): Connector => ({
  id: String(dto.id ?? index),
  connectorId: String(dto.connectorId ?? index + 1),
  portType: text(dto.portType),
  ...toConnectorStatus(dto.status),
  socPercent: toNumber(dto.currentSoc),
  minutesToFull: toNumber(dto.estimatedFullChargeMinutes),
});

// A charger without a tariff used to crash the old mapper; it now just has no price.
const toCharger = (dto: ChargerDto, index: number): Charger => {
  const price = toNumber(dto.tariff?.[0]?.price);

  return {
    id: String(dto.id ?? index),
    chargerId: text(dto.chargerId) ?? String(dto.id ?? index + 1),
    capacityKw: toNumber(dto.capacity),
    powerType: text(dto.powerType)?.toUpperCase() ?? null,
    pricePerKwhPaise: price === null ? null : rupeesToPaise(price),
    connectors: (dto.connectors ?? []).map(toConnector),
  };
};

export const toStationDetails = (dto: StationDetailsDto): StationDetails => {
  const location = dto.stationLocation;

  return {
    id: String(dto.id),
    name: dto.name?.trim() || '—',
    address: joinAddress(location?.address, location?.city),
    latitude: toNumber(location?.latitude) ?? 0,
    longitude: toNumber(location?.longitude) ?? 0,
    status: toStationStatus(dto.status ?? dto.stationStatus),
    rawStatus: text(dto.status ?? dto.stationStatus) ?? '',
    phone: text(dto.helpNumber),
    accessType: text(dto.stationType),
    amenities: (dto.amenities ?? []).map(item => text(item.name)).filter(isPresent),
    imageUrls: (dto.stationMedia ?? []).map(media => webUrl(media.url)).filter(isPresent),
    chargers: (dto.chargers ?? []).map(toCharger),
  };
};

export const toFavouriteIds = (dtos: FavouriteDto[]): string[] =>
  dtos.map(dto => (dto.stationId == null ? null : String(dto.stationId))).filter(isPresent);

function isPresent<T>(value: T | null): value is T {
  return value !== null;
}

// The old app loaded the first 100 favourites to mark hearts; keep the same window.
const FAVOURITES_WINDOW = 100;

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

  // The Stations tab: nearest first, optionally filtered by name, one page at a time.
  searchStations: async ({
    center,
    search,
    page,
    limit,
    signal,
  }: StationSearchQuery): Promise<NearbyStation[]> => {
    const res = await api.get<Envelope<NearbyStationDto[] | null>>(ENDPOINTS.STATIONS.LIST, {
      params: {
        latitude: center.latitude,
        longitude: center.longitude,
        limit,
        page,
        ...(search ? { search } : {}),
      },
      signal,
    });
    return (unwrap(res) ?? []).map(toNearbyStation).filter(isPresent);
  },

  getDetails: async (stationId: string): Promise<StationDetails> => {
    const res = await api.get<Envelope<StationDetailsDto>>(ENDPOINTS.STATIONS.DETAILS(stationId));
    return toStationDetails(unwrap(res));
  },

  getFavouriteIds: async (): Promise<string[]> => {
    const res = await api.get<Envelope<FavouriteDto[] | null>>(ENDPOINTS.STATIONS.FAVOURITES, {
      params: { page: 1, limit: FAVOURITES_WINDOW },
    });
    return toFavouriteIds(unwrap(res) ?? []);
  },

  // `isFavourite` is the new state, not a toggle (the old app always sent false).
  setFavourite: async (stationId: string, isFavourite: boolean): Promise<void> => {
    await api.post(ENDPOINTS.STATIONS.FAVOURITE(stationId), { isFavourite });
  },
};
