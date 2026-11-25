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

type ConnectorDto = {
  id?: number | string | null;
  connectorId?: number | string | null;
  portType?: string | null;
  status?: string | null;
  currentSoc?: NumberLike;
  estimatedFullChargeMinutes?: NumberLike;
};

type ChargerDto = {
  id?: number | string | null;
  chargerId?: string | null;
  capacity?: NumberLike;
  powerType?: string | null;
  status?: string | null;
  tariff?: { price?: NumberLike }[] | null;
  connectors?: ConnectorDto[] | null;
};

export type StationDetailsDto = {
  id: number | string;
  name?: string | null;
  status?: string | null;
  stationStatus?: string | null;
  helpNumber?: string | null;
  amenities?: { name?: string | null }[] | null;
  stationMedia?: { url?: string | null }[] | null;
  stationLocation?: StationLocationDto;
  chargers?: ChargerDto[] | null;
};

export type FavouriteDto = { stationId?: number | string | null };

export type ConnectorState =
  | 'available'
  | 'preparing'
  | 'charging'
  | 'finishing'
  | 'reserved'
  | 'unavailable'
  | 'faulted'
  | 'unknown';

export type Connector = {
  id: string;
  connectorId: string;
  portType: string | null;
  state: ConnectorState;
  socPercent: number | null;
  minutesToFull: number | null;
};

export type Charger = {
  id: string;
  chargerId: string;
  capacityKw: number | null;
  powerType: string | null;
  pricePerKwhPaise: number | null;
  connectors: Connector[];
};

export type StationDetails = Coordinates & {
  id: string;
  name: string;
  address: string;
  status: StationStatus;
  phone: string | null;
  amenities: string[];
  imageUrl: string | null;
  chargers: Charger[];
};

export type DetailsTab = 'chargers' | 'info';
