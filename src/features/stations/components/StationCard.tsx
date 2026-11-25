import { StyleSheet, View } from 'react-native';

import { ChevronRight, Clock, MapPin, Zap } from 'lucide-react-native';

import { AppCard, AppStatusChip, AppText } from '@/shared/components';

import { useTheme } from '@/shared/theme';

import { formatPaise } from '@/shared/utils/money';

import type { NearbyStation } from '../types/stations.types';
import { formatDistance, formatEta } from '../utils/geo';
import { availabilityOf } from '../utils/status';

type StationCardProps = {
  station: NearbyStation;
  selected: boolean;
  width: number;
  onPress: (stationId: string) => void;
};

const StationCard = ({ station, selected, width, onPress }: StationCardProps) => {
  const t = useTheme();
  const availability = availabilityOf(station);

  const chip = { backgroundColor: t.colors.surfaceSunken, borderRadius: t.radius.pill };

  return (
    <AppCard
      onPress={() => onPress(station.id)}
      accessibilityLabel={`${station.name}, ${availability.label}`}
      style={[
        { width, gap: t.space[2] },
        selected && { borderColor: t.colors.accent, borderWidth: 2 },
      ]}
    >
      <View style={[styles.row, { gap: t.space[2] }]}>
        <View style={styles.grow}>
          <AppText variant="headline" numberOfLines={1}>
            {station.name}
          </AppText>
          {station.distanceKm !== null ? (
            <View style={[styles.row, { gap: t.space[1] }]}>
              <MapPin color={t.colors.textTertiary} size={14} />
              <AppText variant="caption" tone="secondary" tabular>
                {formatDistance(station.distanceKm)}
              </AppText>
              <AppText variant="caption" tone="tertiary">
                ·
              </AppText>
              <Clock color={t.colors.textTertiary} size={14} />
              <AppText variant="caption" tone="secondary" tabular>
                {formatEta(station.distanceKm)}
              </AppText>
            </View>
          ) : null}
        </View>
        <View
          style={[
            styles.chevron,
            { backgroundColor: t.colors.accentSoft, borderRadius: t.radius.pill },
          ]}
        >
          <ChevronRight color={t.colors.accentText} size={18} />
        </View>
      </View>

      <View style={[styles.row, styles.wrap, { gap: t.space[2] }]}>
        <AppStatusChip label={availability.label} tone={availability.tone} />
        {station.pricePerKwhPaise !== null ? (
          <View style={[styles.chip, chip]}>
            <AppText variant="caption" tabular>
              {formatPaise(station.pricePerKwhPaise)}/kWh
            </AppText>
          </View>
        ) : null}
        {station.maxPowerKw !== null ? (
          <View style={[styles.chip, chip, { gap: t.space[1] }]}>
            <Zap color={t.colors.accentText} size={12} />
            <AppText variant="caption" tabular>
              {station.maxPowerKw} kW
            </AppText>
          </View>
        ) : null}
        {station.connectorTypes.slice(0, 2).map(type => (
          <View key={type} style={[styles.chip, chip]}>
            <AppText variant="caption" tone="secondary">
              {type}
            </AppText>
          </View>
        ))}
      </View>

      {station.address ? (
        <AppText variant="caption" tone="tertiary" numberOfLines={1}>
          {station.address}
        </AppText>
      ) : null}
    </AppCard>
  );
};

export default StationCard;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  wrap: {
    flexWrap: 'wrap',
  },
  grow: {
    flex: 1,
    gap: 2,
  },
  chevron: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chip: {
    height: 28,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
});
