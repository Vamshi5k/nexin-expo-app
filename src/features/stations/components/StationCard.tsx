import { StyleSheet, View } from 'react-native';

import { Navigation } from 'lucide-react-native';

import { AppPressable, AppStatusChip, AppText } from '@/shared/components';

import ChargeCells from './ChargeCells';

import { useTheme, type Theme } from '@/shared/theme';

import { brand } from '@/core/config';
import { formatRate } from '@/shared/utils/money';

import { allInUse, CARD_COPY, freeOfTotal, MAX_ETA_KM } from '../constants/stations.constants';
import type { NearbyStation } from '../types/stations.types';
import { formatDistance, formatEta } from '../utils/geo';
import { availabilityOf, badgeOf, pinColorKey, STATUS_LABEL } from '../utils/status';

type StationCardProps = {
  station: NearbyStation;
  selected: boolean;
  width: number;
  onPress: (stationId: string) => void;
  onDirections: (station: NearbyStation) => void;
};

// Status chip and price row, name, context line, the gap and the action row: the skeleton and the
// view-all tile use the same height.
export const stationCardHeight = (t: Theme) =>
  t.space[5] * 2 +
  t.space[6] +
  t.space[1] +
  Number(t.type.headline.lineHeight) +
  Number(t.type.caption.lineHeight) +
  t.space[1] * 2 +
  t.space[4] +
  t.layout.minTouch;

const contextLine = (station: NearbyStation) => {
  const distance =
    station.distanceKm !== null ? formatDistance(station.distanceKm, brand.locale) : null;
  return [distance, station.address].filter(Boolean).join(' · ');
};

const connectorLine = (station: NearbyStation) => {
  const [first, ...rest] = station.connectorTypes;
  const parts = [
    first ? (rest.length ? `${first} +${rest.length}` : first) : null,
    station.maxPowerKw !== null ? `${station.maxPowerKw} kW` : null,
  ];
  return parts.filter(Boolean).join(' · ');
};

// The action carries the drive time, so "how far" and "take me there" are one tap.
const goLabel = (km: number | null) => (km !== null && km <= MAX_ETA_KM ? formatEta(km) : null);

const StationCard = ({ station, selected, width, onPress, onDirections }: StationCardProps) => {
  const t = useTheme();
  const availability = availabilityOf(station);
  const badge = badgeOf(station);
  const context = contextLine(station);
  const connector = connectorLine(station);
  const eta = goLabel(station.distanceKm);

  const usage =
    badge.kind === 'free'
      ? { text: freeOfTotal(badge.free, badge.total), color: t.colors.successText }
      : badge.kind === 'busy'
        ? { text: allInUse(badge.total), color: t.colors.warningText }
        : null;

  return (
    <AppPressable
      onPress={() => onPress(station.id)}
      accessibilityRole="button"
      accessibilityLabel={`${station.name}, ${availability.label}`}
      style={{
        width,
        gap: t.space[4],
        padding: t.space[5],
        borderRadius: t.radius.sheet,
        borderWidth: t.layout.selectedBorder,
        backgroundColor: t.colors.surfaceRaised,
        borderColor: selected ? t.colors.accent : t.colors.border,
      }}
    >
      <View style={{ gap: t.space[1] }}>
        <View style={[styles.row, { gap: t.space[3] }]}>
          <View style={styles.grow}>
            <AppStatusChip
              label={STATUS_LABEL[station.status]}
              connector={pinColorKey(station.status)}
            />
          </View>
          {station.pricePerKwhPaise !== null ? (
            <AppText variant="headline" tabular>
              {formatRate(station.pricePerKwhPaise)}
              <AppText variant="caption" tone="tertiary">
                {' '}
                {CARD_COPY.price}
              </AppText>
            </AppText>
          ) : null}
        </View>
        <AppText variant="headline" numberOfLines={1}>
          {station.name}
        </AppText>
        {context ? (
          <AppText variant="caption" tone="secondary" numberOfLines={1} tabular>
            {context}
          </AppText>
        ) : null}
      </View>

      <View style={[styles.row, { gap: t.space[3] }]}>
        <View style={[styles.row, styles.grow, { gap: t.space[3] }]}>
          <ChargeCells badge={badge} />
          <View style={styles.shrink}>
            {usage ? (
              <AppText variant="caption" numberOfLines={1} tabular style={{ color: usage.color }}>
                {usage.text}
              </AppText>
            ) : null}
            {connector ? (
              <AppText variant="caption" tone="secondary" numberOfLines={1} tabular>
                {connector}
              </AppText>
            ) : null}
          </View>
        </View>

        <AppPressable
          onPress={() => onDirections(station)}
          haptic="light"
          accessibilityRole="button"
          accessibilityLabel={`${CARD_COPY.directions} ${station.name}`}
          style={[
            styles.row,
            styles.go,
            {
              gap: t.space[2],
              height: t.layout.minTouch,
              minWidth: t.layout.minTouch,
              paddingHorizontal: eta ? t.space[4] : t.space[3],
              borderRadius: t.radius.pill,
              backgroundColor: t.colors.accent,
            },
          ]}
        >
          <Navigation color={t.colors.onAccent} size={t.icon.meta} strokeWidth={t.icon.stroke} />
          {eta ? (
            <AppText variant="subhead" tone="onAccent" tabular>
              {eta}
            </AppText>
          ) : null}
        </AppPressable>
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
  grow: {
    flex: 1,
  },
  shrink: {
    flexShrink: 1,
  },
  go: {
    justifyContent: 'center',
  },
});
