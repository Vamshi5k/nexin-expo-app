import { StyleSheet, View } from 'react-native';

import { Navigation } from 'lucide-react-native';

import { AppConnectorIcon, AppPressable, AppText } from '@/shared/components';

import StationBadge from './StationBadge';

import { useTheme, type Theme } from '@/shared/theme';

import { brand } from '@/core/config';
import { formatRate } from '@/shared/utils/money';

import { CARD_COPY, MAX_ETA_KM } from '../constants/stations.constants';
import type { NearbyStation } from '../types/stations.types';
import { formatDistance, formatEta } from '../utils/geo';
import { availabilityOf, badgeOf } from '../utils/status';

type StationCardProps = {
  station: NearbyStation;
  selected: boolean;
  width: number;
  onPress: (stationId: string) => void;
  onDirections: (station: NearbyStation) => void;
};

// Padding, badge, gap and the footer's touch target: the skeleton and the view-all tile match it.
export const stationCardHeight = (t: Theme) =>
  t.space[4] * 2 + t.space[12] + t.space[2] + t.space[4] + t.layout.minTouch;

const distanceLabel = (km: number | null) => {
  if (km === null) return null;

  const distance = formatDistance(km, brand.locale);
  return km > MAX_ETA_KM ? distance : `${distance} · ${formatEta(km)}`;
};

const connectorLabel = (station: NearbyStation) => {
  const [first, ...rest] = station.connectorTypes;
  const parts = [
    first ? (rest.length ? `${first} +${rest.length}` : first) : null,
    station.maxPowerKw !== null ? `${station.maxPowerKw} kW` : null,
  ];
  return parts.filter(Boolean).join(' · ');
};

const StationCard = ({ station, selected, width, onPress, onDirections }: StationCardProps) => {
  const t = useTheme();
  const availability = availabilityOf(station);
  const distance = distanceLabel(station.distanceKm);
  const connector = station.connectorTypes[0];

  return (
    <AppPressable
      onPress={() => onPress(station.id)}
      accessibilityRole="button"
      accessibilityLabel={`${station.name}, ${availability.label}`}
      style={[
        styles.card,
        {
          width,
          gap: t.space[4],
          padding: t.space[4],
          borderRadius: t.radius.card,
          borderWidth: t.layout.selectedBorder,
          backgroundColor: t.colors.surfaceRaised,
          borderColor: selected ? t.colors.accent : t.colors.border,
        },
      ]}
    >
      <View style={[styles.row, { gap: t.space[3] }]}>
        <StationBadge badge={badgeOf(station)} />
        <View style={styles.grow}>
          <AppText variant="headline" numberOfLines={1}>
            {station.name}
          </AppText>
          {distance ? (
            <AppText variant="caption" tone="secondary" tabular numberOfLines={1}>
              {distance}
            </AppText>
          ) : null}
          {station.address ? (
            <AppText variant="caption" tone="tertiary" numberOfLines={1}>
              {station.address}
            </AppText>
          ) : null}
        </View>
      </View>

      <View style={[styles.row, { gap: t.space[3] }]}>
        <View style={[styles.row, styles.grow, { gap: t.space[2] }]}>
          {connector ? <AppConnectorIcon type={connector} size={t.icon.meta} /> : null}
          <AppText variant="caption" tone="secondary" numberOfLines={1} tabular>
            {connectorLabel(station)}
          </AppText>
        </View>

        {station.pricePerKwhPaise !== null ? (
          <AppText variant="subhead" tabular>
            {formatRate(station.pricePerKwhPaise)}
            <AppText variant="caption" tone="tertiary">
              {' '}
              {CARD_COPY.price}
            </AppText>
          </AppText>
        ) : null}

        <AppPressable
          onPress={() => onDirections(station)}
          haptic="light"
          accessibilityRole="button"
          accessibilityLabel={`${CARD_COPY.directions} ${station.name}`}
          style={[
            styles.go,
            {
              width: t.layout.minTouch,
              height: t.layout.minTouch,
              borderRadius: t.radius.pill,
              backgroundColor: selected ? t.colors.accent : t.colors.surfaceSunken,
            },
          ]}
        >
          <Navigation
            color={selected ? t.colors.onAccent : t.colors.accentText}
            size={t.icon.meta}
            strokeWidth={t.icon.stroke}
          />
        </AppPressable>
      </View>
    </AppPressable>
  );
};

export default StationCard;

const styles = StyleSheet.create({
  card: {
    justifyContent: 'space-between',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  grow: {
    flex: 1,
  },
  go: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
