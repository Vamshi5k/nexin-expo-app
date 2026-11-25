import { StyleSheet, View } from 'react-native';

import { MapPin, Navigation, Zap, type LucideIcon } from 'lucide-react-native';

import { AppPressable, AppStatusChip, AppText } from '@/shared/components';

import { useTheme, type Theme } from '@/shared/theme';

import { brand } from '@/core/config';
import { formatRate } from '@/shared/utils/money';

import { CARD_COPY, MAX_ETA_KM } from '../constants/stations.constants';
import type { NearbyStation } from '../types/stations.types';
import { formatDistance, formatEta } from '../utils/geo';
import { availabilityOf, pinColorKey, STATUS_LABEL } from '../utils/status';

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

type FigureProps = { icon: LucideIcon; value: string };

// A highlighted figure: power and distance are what a driver compares between stations.
const Figure = ({ icon: Icon, value }: FigureProps) => {
  const t = useTheme();

  return (
    <View style={[styles.row, { gap: t.space[1] }]}>
      <Icon color={t.colors.accentText} size={t.icon.meta} strokeWidth={t.icon.stroke} />
      <AppText variant="headline" tabular numberOfLines={1}>
        {value}
      </AppText>
    </View>
  );
};

const contextLine = (station: NearbyStation) => {
  const [first, ...rest] = station.connectorTypes;
  const connector = first ? (rest.length ? `${first} +${rest.length}` : first) : null;
  return [connector, station.address].filter(Boolean).join(' · ');
};

// The action carries the drive time, so "how far" and "take me there" are one tap.
const goLabel = (km: number | null) => (km !== null && km <= MAX_ETA_KM ? formatEta(km) : null);

const StationCard = ({ station, selected, width, onPress, onDirections }: StationCardProps) => {
  const t = useTheme();
  const availability = availabilityOf(station);
  const context = contextLine(station);
  const eta = goLabel(station.distanceKm);
  const power = station.maxPowerKw !== null ? `${station.maxPowerKw} kW` : null;
  const distance =
    station.distanceKm !== null ? formatDistance(station.distanceKm, brand.locale) : null;

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
        <View style={[styles.row, styles.grow, { gap: t.space[4] }]}>
          {power ? <Figure icon={Zap} value={power} /> : null}
          {distance ? <Figure icon={MapPin} value={distance} /> : null}
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
  go: {
    justifyContent: 'center',
  },
});
