import { StyleSheet, View } from 'react-native';

import { MapPin, Navigation, Zap } from 'lucide-react-native';

import { AppPressable, AppText } from '@/shared/components';

import CardGradient from './CardGradient';
import ChargerArt from './ChargerArt';

import { useTheme, withAlpha, type Theme } from '@/shared/theme';

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

// Three rows on one grid: pills, title with art, footer. Fixed row heights keep every card in
// the carousel the same size; the skeleton and the view-all tile use the same total.
const pillHeight = (t: Theme) => t.space[6] + t.space[1];
const artSize = (t: Theme) => t.space[12] + t.space[6];

export const stationCardHeight = (t: Theme) =>
  t.space[4] * 2 + pillHeight(t) + artSize(t) + t.layout.minTouch + t.space[3] * 2;

const tripLabel = (km: number | null) => {
  if (km === null) return null;

  const distance = formatDistance(km, brand.locale);
  return km > MAX_ETA_KM ? distance : `${distance} · ${formatEta(km)}`;
};

// The carousel already scales the focused card up, so selection needs no border of its own.
const StationCard = ({ station, width, onPress, onDirections }: StationCardProps) => {
  const t = useTheme();
  const availability = availabilityOf(station);
  const trip = tripLabel(station.distanceKm);
  const statusColor = t.colors.connector[pinColorKey(station.status)];

  const pill = {
    height: pillHeight(t),
    gap: t.space[2],
    paddingHorizontal: t.space[3],
    borderRadius: t.radius.pill,
  };

  return (
    <AppPressable
      onPress={() => onPress(station.id)}
      accessibilityRole="button"
      accessibilityLabel={`${station.name}, ${availability.label}`}
      style={[
        styles.card,
        {
          width,
          gap: t.space[3],
          padding: t.space[4],
          borderRadius: t.radius.sheet,
          borderWidth: t.layout.hairline,
          backgroundColor: t.colors.surfaceRaised,
          borderColor: t.colors.border,
        },
      ]}
    >
      <CardGradient color={statusColor} id={`station-card-${station.id}`} />

      <View style={[styles.row, styles.between]}>
        <View style={[styles.row, pill, { backgroundColor: t.colors.surface }]}>
          <View
            style={{
              width: t.space[2],
              height: t.space[2],
              borderRadius: t.radius.pill,
              backgroundColor: statusColor,
            }}
          />
          <AppText variant="caption">{STATUS_LABEL[station.status]}</AppText>
        </View>

        {station.maxPowerKw !== null ? (
          <View
            style={[
              styles.row,
              pill,
              { gap: t.space[1], backgroundColor: withAlpha(t.colors.surface, 0.8) },
            ]}
          >
            <Zap
              color={t.colors.accentText}
              fill={t.colors.accentText}
              size={t.icon.meta}
              strokeWidth={t.icon.stroke}
            />
            <AppText variant="subhead" tabular>
              {station.maxPowerKw} kW
            </AppText>
          </View>
        ) : null}
      </View>

      <View style={[styles.row, { height: artSize(t), gap: t.space[3] }]}>
        <View style={styles.grow}>
          <AppText variant="headline" numberOfLines={2}>
            {station.name}
          </AppText>
          {station.address ? (
            <AppText variant="caption" tone="secondary" numberOfLines={1}>
              {station.address}
            </AppText>
          ) : null}
        </View>
        <ChargerArt size={artSize(t)} glow={statusColor} />
      </View>

      <View style={[styles.row, { height: t.layout.minTouch, gap: t.space[3] }]}>
        <View style={styles.grow}>
          {trip ? (
            <View style={[styles.row, { gap: t.space[1] }]}>
              <MapPin color={t.colors.accentText} size={t.icon.meta} strokeWidth={t.icon.stroke} />
              <AppText variant="subhead" tabular numberOfLines={1}>
                {trip}
              </AppText>
            </View>
          ) : null}
          {station.pricePerKwhPaise !== null ? (
            <AppText variant="caption" tone="secondary" tabular>
              {formatRate(station.pricePerKwhPaise)} {CARD_COPY.price}
            </AppText>
          ) : null}
        </View>

        <AppPressable
          onPress={() => onDirections(station)}
          haptic="light"
          accessibilityRole="button"
          accessibilityLabel={`${CARD_COPY.directions} ${station.name}`}
          style={[
            styles.row,
            {
              gap: t.space[2],
              height: t.layout.minTouch,
              paddingHorizontal: t.space[5],
              borderRadius: t.radius.pill,
              backgroundColor: t.colors.textPrimary,
            },
          ]}
        >
          <Navigation color={t.colors.surface} size={t.icon.meta} strokeWidth={t.icon.stroke} />
          <AppText variant="subhead" style={{ color: t.colors.surface }}>
            {CARD_COPY.go}
          </AppText>
        </AppPressable>
      </View>
    </AppPressable>
  );
};

export default StationCard;

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  between: {
    justifyContent: 'space-between',
  },
  grow: {
    flex: 1,
  },
});
