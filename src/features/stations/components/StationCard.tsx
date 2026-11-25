import { StyleSheet, View } from 'react-native';

import { MapPin, Navigation, Zap } from 'lucide-react-native';

import { AppPressable, AppText } from '@/shared/components';

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

const headerHeight = (t: Theme) => t.space[12] * 2 + t.space[6];
const artSize = (t: Theme) => t.space[12] * 2;

// Illustrated header plus the footer row: the skeleton and the view-all tile use the same height.
export const stationCardHeight = (t: Theme) => headerHeight(t) + t.space[3] * 2 + t.layout.minTouch;

const tripLabel = (km: number | null) => {
  if (km === null) return null;

  const distance = formatDistance(km, brand.locale);
  return km > MAX_ETA_KM ? distance : `${distance} · ${formatEta(km)}`;
};

const StationCard = ({ station, selected, width, onPress, onDirections }: StationCardProps) => {
  const t = useTheme();
  const availability = availabilityOf(station);
  const trip = tripLabel(station.distanceKm);
  const onHeader = t.colors.onAccent;

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
      <View
        style={[
          styles.header,
          { height: headerHeight(t), padding: t.space[4], backgroundColor: t.colors.accent },
        ]}
      >
        <View style={[styles.art, { right: -t.space[1], bottom: -t.space[6] }]}>
          <ChargerArt size={artSize(t)} />
        </View>

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
                backgroundColor: t.colors.connector[pinColorKey(station.status)],
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
                  backgroundColor: withAlpha(t.colors.surface, 0.2),
                },
              ]}
            >
              <Zap
                color={onHeader}
                fill={onHeader}
                size={t.icon.meta}
                strokeWidth={t.icon.stroke}
              />
              <AppText variant="subhead" tabular style={{ color: onHeader }}>
                {station.maxPowerKw} kW
              </AppText>
            </View>
          ) : null}
        </View>

        <View style={styles.title}>
          <AppText variant="headline" numberOfLines={2} style={{ color: onHeader }}>
            {station.name}
          </AppText>
          {station.address ? (
            <AppText variant="caption" numberOfLines={1} style={{ color: onHeader }}>
              {station.address}
            </AppText>
          ) : null}
        </View>
      </View>

      <View
        style={[
          styles.row,
          { gap: t.space[3], paddingHorizontal: t.space[4], paddingVertical: t.space[3] },
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
  header: {
    justifyContent: 'space-between',
    overflow: 'hidden',
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
