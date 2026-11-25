import { StyleSheet, View } from 'react-native';

import { Zap } from 'lucide-react-native';

import { AppPressable, AppText } from '@/shared/components';

import { useTheme } from '@/shared/theme';

import { formatPaise } from '@/shared/utils/money';

import { CARD_COPY, MAX_ETA_KM } from '../constants/stations.constants';
import type { NearbyStation } from '../types/stations.types';
import { formatDistance, formatEta } from '../utils/geo';
import { availabilityOf, type Availability } from '../utils/status';

type StationCardProps = {
  station: NearbyStation;
  selected: boolean;
  width: number;
  onPress: (stationId: string) => void;
};

export const STATION_CARD_HEIGHT = 84;

const distanceLabel = (km: number | null) => {
  if (km === null) return null;
  if (km > MAX_ETA_KM) return formatDistance(km);
  return `${formatDistance(km)} · ${formatEta(km)}`;
};

const StationCard = ({ station, selected, width, onPress }: StationCardProps) => {
  const t = useTheme();
  const availability = availabilityOf(station);

  const dotColor: Record<Availability['tone'], string> = {
    success: t.colors.success,
    warning: t.colors.warning,
    danger: t.colors.danger,
    neutral: t.colors.textTertiary,
  };

  const details = [
    availability.label,
    station.maxPowerKw !== null ? `${station.maxPowerKw} kW` : null,
    distanceLabel(station.distanceKm),
  ]
    .filter(Boolean)
    .join(' · ');

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
          borderRadius: t.radius.card,
          backgroundColor: t.colors.surfaceRaised,
          borderColor: selected ? t.colors.accent : t.colors.border,
        },
      ]}
    >
      <View
        style={[
          styles.tile,
          {
            borderRadius: t.radius.control,
            backgroundColor: selected ? t.colors.accent : t.colors.accentSoft,
          },
        ]}
      >
        <Zap
          color={selected ? t.colors.onAccent : t.colors.accentText}
          size={20}
          strokeWidth={1.75}
        />
      </View>

      <View style={styles.body}>
        <AppText variant="headline" numberOfLines={1}>
          {station.name}
        </AppText>
        <View style={[styles.row, { gap: t.space[2] }]}>
          <View style={[styles.dot, { backgroundColor: dotColor[availability.tone] }]} />
          <AppText variant="caption" tone="secondary" numberOfLines={1} style={styles.body} tabular>
            {details}
          </AppText>
        </View>
      </View>

      {station.pricePerKwhPaise !== null ? (
        <View style={styles.price}>
          <AppText variant="headline" tabular>
            {formatPaise(station.pricePerKwhPaise)}
          </AppText>
          <AppText variant="caption" tone="tertiary">
            {CARD_COPY.price}
          </AppText>
        </View>
      ) : null}
    </AppPressable>
  );
};

export default StationCard;

const styles = StyleSheet.create({
  card: {
    height: STATION_CARD_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    borderWidth: 1,
  },
  tile: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    gap: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  price: {
    alignItems: 'flex-end',
  },
});
