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

const topHeight = (t: Theme) => t.space[12] * 2 + t.space[6];
// Sits between the pills and the footer so it never touches the Go button.
const artSize = (t: Theme) => t.space[12] + t.space[8];

// Top block (pills, name, address) and the footer row: the skeleton and the view-all tile match.
export const stationCardHeight = (t: Theme) =>
  topHeight(t) + t.space[3] + t.space[4] + t.layout.minTouch;

const tripLabel = (km: number | null) => {
  if (km === null) return null;

  const distance = formatDistance(km, brand.locale);
  return km > MAX_ETA_KM ? distance : `${distance} · ${formatEta(km)}`;
};

const StationCard = ({ station, selected, width, onPress, onDirections }: StationCardProps) => {
  const t = useTheme();
  const availability = availabilityOf(station);
  const trip = tripLabel(station.distanceKm);
  const statusColor = t.colors.connector[pinColorKey(station.status)];

  return (
    <AppPressable
      onPress={() => onPress(station.id)}
      accessibilityRole="button"
      accessibilityLabel={`${station.name}, ${availability.label}`}
      style={[
        styles.card,
        {
          width,
          borderRadius: t.radius.sheet,
          borderWidth: t.layout.selectedBorder,
          backgroundColor: t.colors.surfaceRaised,
          borderColor: selected ? t.colors.accent : t.colors.border,
        },
      ]}
    >
      <CardGradient color={statusColor} id={`station-card-${station.id}`} />

      <View style={[styles.art, { top: t.space[10], right: t.space[2] }]}>
        <ChargerArt size={artSize(t)} glow={statusColor} />
      </View>

      <View
        style={[
          styles.top,
          { height: topHeight(t), paddingHorizontal: t.space[4], paddingTop: t.space[4] },
        ]}
      >
        <View style={[styles.row, styles.between]}>
          <View
            style={[
              styles.row,
              {
                gap: t.space[2],
                paddingHorizontal: t.space[3],
                paddingVertical: t.space[1],
                borderRadius: t.radius.pill,
                backgroundColor: t.colors.surface,
              },
            ]}
          >
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
                {
                  gap: t.space[1],
                  paddingHorizontal: t.space[3],
                  paddingVertical: t.space[1],
                  borderRadius: t.radius.pill,
                  backgroundColor: withAlpha(t.colors.surface, 0.8),
                },
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

        <View style={styles.title}>
          <AppText variant="headline" numberOfLines={2}>
            {station.name}
          </AppText>
          {station.address ? (
            <AppText variant="caption" tone="secondary" numberOfLines={1}>
              {station.address}
            </AppText>
          ) : null}
        </View>
      </View>

      <View
        style={[
          styles.row,
          {
            gap: t.space[3],
            paddingHorizontal: t.space[4],
            paddingTop: t.space[3],
            paddingBottom: t.space[4],
          },
        ]}
      >
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
  top: {
    justifyContent: 'space-between',
  },
  art: {
    position: 'absolute',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  between: {
    justifyContent: 'space-between',
  },
  title: {
    maxWidth: '70%',
  },
  grow: {
    flex: 1,
  },
});
