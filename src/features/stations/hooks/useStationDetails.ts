import { useCallback, useState } from 'react';
import { Linking, Share } from 'react-native';

import * as ExpoLinking from 'expo-linking';
import { router } from 'expo-router';

import { getErrorMessage } from '@/core/api';
import { brand } from '@/core/config';
import { useRequest } from '@/core/request';
import { toast } from '@/shared/utils/toast';

import { useDirections } from './useDirections';
import { useUserLocation } from './useUserLocation';
import { stationsApi } from '../api/stations.api';
import { connectorBusy, DETAILS_COPY, DETAILS_HREF } from '../constants/stations.constants';
import type { Charger, Connector } from '../types/stations.types';
import { canStartCharging, CONNECTOR_LABEL, sortChargers } from '../utils/connector';
import { distanceKm } from '../utils/geo';
import { shareMessage } from '../utils/share';

export const useStationDetails = (stationId: string) => {
  const loadDetails = useCallback(() => stationsApi.getDetails(stationId), [stationId]);
  const details = useRequest(loadDetails);
  const favourites = useRequest(stationsApi.getFavouriteIds);
  const { location } = useUserLocation();
  const directions = useDirections();

  const [refreshing, setRefreshing] = useState(false);
  const [favouriteOverride, setFavouriteOverride] = useState<boolean | null>(null);
  const [savingFavourite, setSavingFavourite] = useState(false);

  const station = details.data ?? null;
  const isFavourite = favouriteOverride ?? favourites.data?.includes(stationId) ?? false;
  const distance = station && location ? distanceKm(location, station) : null;

  const refresh = async () => {
    if (refreshing) return;

    setRefreshing(true);
    await Promise.all([details.refetch(), favourites.refetch()]);
    setRefreshing(false);
  };

  // Optimistic: the heart flips at once and flips back if the server says no.
  const toggleFavourite = async () => {
    if (savingFavourite) return;

    const next = !isFavourite;
    setFavouriteOverride(next);
    setSavingFavourite(true);
    try {
      await stationsApi.setFavourite(stationId, next);
      toast.success(next ? DETAILS_COPY.added : DETAILS_COPY.removed);
    } catch (error) {
      setFavouriteOverride(!next);
      toast.error(getErrorMessage(error));
    } finally {
      setSavingFavourite(false);
    }
  };

  const share = () => {
    if (!station) return;

    const message = shareMessage(station, {
      appUrl: ExpoLinking.createURL(`station/${station.id}`),
      webDomain: brand.deepLinkDomains[0] ?? null,
    });
    Share.share({ message }).catch(() => toast.error(DETAILS_COPY.shareError));
  };

  const call = () => {
    if (!station?.phone) return;
    Linking.openURL(`tel:${station.phone}`).catch(() => toast.error(DETAILS_COPY.callError));
  };

  const openConnector = (charger: Charger, connector: Connector) => {
    if (!canStartCharging(connector.state)) {
      toast.info(connectorBusy(CONNECTOR_LABEL[connector.state]));
      return;
    }

    router.push({
      pathname: DETAILS_HREF.chargingSummary,
      params: { stationId, chargerId: charger.chargerId, connectorId: connector.connectorId },
    });
  };

  // A deep link opens this screen with nothing behind it; go to the map instead of nowhere.
  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace(DETAILS_HREF.home);
  };

  return {
    station,
    chargers: station ? sortChargers(station.chargers) : [],
    loading: details.loading && !station,
    error: station ? null : details.error,
    refreshing,
    distance,
    isFavourite,
    retry: details.refetch,
    refresh,
    toggleFavourite,
    share,
    call,
    openConnector,
    goBack,
    directions,
    openDirections: () => {
      if (station) directions.open(station);
    },
  };
};
