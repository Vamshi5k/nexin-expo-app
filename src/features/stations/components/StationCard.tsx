import { StyleSheet, View } from 'react-native';

import { Navigation, Zap } from 'lucide-react-native';

import { AppPressable, AppText } from '@/shared/components';

import StationStatusStrip from './StationStatusStrip';

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

// Header row, status strip and meta row with the gaps between them: the skeleton and the
// view-all tile use the same height.
export const stationCardHeight = (t: Theme) =>
  t.space[4] * 2 +
  t.layout.minTouch +
  t.space[3] * 2 +
  t.space[2] * 2 +
  Number(t.type.subhead.lineHeight) +
  Number(t.type.title2.lineHeight);

const tripLabel = (km: number | null) => {
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
  return parts.filter(Boolean).join(' ');
};

const StationCard = ({ station, selected, width, onPress, onDirections }: StationCardProps) => {
  const t = useTheme();
  const availability = availabilityOf(station);
  const trip = tripLabel(station.distanceKm);
  const connector = connectorLabel(station);

  return (
    <AppPressable
      onPress={() => onPress(station.id)}
      accessibilityRole="button"
      accessibilityLabel={`${station.name}, ${availability.label}`}
      style={[
        {
          width,
          gap: t.space[3],
          padding: t.space[4],
          borderRadius: t.radius.sheet,
          borderWidth: t.layout.selectedBorder,
          backgroundColor: t.colors.surfaceRaised,
          borderColor: selected ? t.colors.accent : t.colors.border,
        },
      ]}
    >
      <View style={[styles.row, { gap: t.space[3] }]}>
        <View
          style={[
            styles.center,
            {
              width: t.layout.minTouch,
              height: t.layout.minTouch,
              borderRadius: t.radius.control,
              backgroundColor: t.colors.accentSoft,
            },
          ]}
        >
          <Zap color={t.colors.accentText} size={t.icon.control} strokeWidth={t.icon.stroke} />
        </View>

        <View style={styles.grow}>
          <AppText variant="headline" numberOfLines={1}>
            {station.name}
          </AppText>
          {station.address ? (
            <AppText variant="subhead" tone="secondary" numberOfLines={1}>
              {station.address}
            </AppText>
          ) : null}
        </View>

        <AppPressable
          onPress={() => onDirections(station)}
          haptic="light"
          accessibilityRole="button"
          accessibilityLabel={`${CARD_COPY.directions} ${station.name}`}
          style={[
            styles.center,
            {
              width: t.layout.minTouch,
              height: t.layout.minTouch,
              borderRadius: t.radius.control,
              backgroundColor: t.colors.accent,
            },
          ]}
        >
          <Navigation color={t.colors.onAccent} size={t.icon.control} strokeWidth={t.icon.stroke} />
        </AppPressable>
      </View>

      <StationStatusStrip badge={badgeOf(station)} />

      <View style={[styles.row, { gap: t.space[3] }]}>
        <AppText
          variant="subhead"
          tone="secondary"
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.85}
          tabular
          style={styles.grow}
        >
          {trip}
          {trip && connector ? ' · ' : ''}
          {connector ? <AppText variant="subhead">{connector}</AppText> : null}
        </AppText>

        {station.pricePerKwhPaise !== null ? (
          <AppText variant="title2" tabular>
            {formatRate(station.pricePerKwhPaise)}
            <AppText variant="caption" tone="tertiary">
              {' '}
              {CARD_COPY.price}
            </AppText>
          </AppText>
        ) : null}
      </View>
    </AppPressable>
  );
};

export default StationCard;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  grow: {
    flex: 1,
  },
});
