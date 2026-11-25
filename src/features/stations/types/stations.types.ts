import type { ConnectorType } from '@/shared/components';

type NumberLike = number | string | null | undefined;

type StationLocationDto = {
  latitude?: NumberLike;
  longitude?: NumberLike;
  address?: string | null;
  city?: string | null;
} | null;

export type StationPinDto = {
  id: number | string;
  name?: string | null;
  stationUniqueId?: string | null;
  stationType?: string | null;
  status?: string | null;
  stationStatus?: string | null;
  stationLocation?: StationLocationDto;
};

export type NearbyStationDto = {
  id: number | string;
  name?: string | null;
  distance?: NumberLike;
  totalConnectors?: NumberLike;
  availableConnectors?: NumberLike;
  connectorTypes?: string | null;
  maxPowerOutput?: NumberLike;
  minStartingPrice?: NumberLike;
  status?: string | null;
  stationStatus?: string | null;
  stationLocation?: StationLocationDto;
};

export type StationStatus = 'available' | 'upcoming' | 'maintenance' | 'unavailable' | 'unknown';

export type Coordinates = { latitude: number; longitude: number };

export type StationPin = Coordinates & {
  id: string;
  name: string;
  status: StationStatus;
};

export type NearbyStation = Coordinates & {
  id: string;
  name: string;
  address: string;
  distanceKm: number | null;
  availableConnectors: number | null;
  totalConnectors: number | null;
  connectorTypes: string[];
  maxPowerKw: number | null;
  pricePerKwhPaise: number | null;
  status: StationStatus;
};

export type StationAccess = 'any' | 'public' | 'private';

export type StationFilters = {
  minPowerKw: number | null;
  access: StationAccess;
  connectorTypes: ConnectorType[];
};

export type StationFilterParams = {
  min_power_output?: number;
  stationType?: string;
  connectorTypes?: string;
};

export type MapRegion = Coordinates & { latitudeDelta: number; longitudeDelta: number };
