import { StyleSheet, View } from 'react-native';

import { ArrowUpRight } from 'lucide-react-native';

import { AppCard, AppStatusChip, AppText } from '@/shared/components';

import { useTheme } from '@/shared/theme';

import { formatPaise } from '@/shared/utils/money';

import { CARD_COPY, MAX_ETA_KM } from '../constants/stations.constants';
import type { NearbyStation } from '../types/stations.types';
import { formatDistance, formatEta } from '../utils/geo';
import { availabilityOf } from '../utils/status';

type StationCardProps = {
  station: NearbyStation;
  selected: boolean;
  width: number;
  onPress: (stationId: string) => void;
};

type StatProps = { label: string; value: string };

const Stat = ({ label, value }: StatProps) => (
  <View style={styles.stat}>
    <AppText variant="headline" tabular numberOfLines={1}>
      {value}
    </AppText>
    <AppText variant="caption" tone="tertiary" numberOfLines={1}>
      {label}
    </AppText>
  </View>
);

const connectorSummary = (types: string[]) => {
  if (!types.length) return '—';
  return types.length > 1 ? `${types[0]} +${types.length - 1}` : types[0];
};

const distanceLabel = (km: number | null) => {
  if (km === null) return null;
  if (km > MAX_ETA_KM) return formatDistance(km);
  return `${formatDistance(km)} · ${formatEta(km)}`;
};

const StationCard = ({ station, selected, width, onPress }: StationCardProps) => {
  const t = useTheme();
  const availability = availabilityOf(station);

  const distance = distanceLabel(station.distanceKm);

  return (
    <AppCard
      elevation="elevated"
      onPress={() => onPress(station.id)}
      accessibilityLabel={`${station.name}, ${availability.label}`}
      style={[
        { width, gap: t.space[3], borderRadius: t.radius.sheet, padding: t.space[5] },
        selected && { borderColor: t.colors.accent, borderWidth: 1.5 },
      ]}
    >
      <View style={[styles.row, styles.between]}>
        <AppStatusChip label={availability.label} tone={availability.tone} />
        {distance ? (
          <AppText variant="caption" tone="secondary" tabular>
            {distance}
          </AppText>
        ) : null}
      </View>

      <View style={[styles.row, { gap: t.space[3] }]}>
        <View style={styles.grow}>
          <AppText variant="title2" numberOfLines={1}>
            {station.name}
          </AppText>
          {station.address ? (
            <AppText variant="subhead" tone="secondary" numberOfLines={1}>
              {station.address}
            </AppText>
          ) : null}
        </View>
        <View
          style={[styles.go, { backgroundColor: t.colors.accentSoft, borderRadius: t.radius.pill }]}
        >
          <ArrowUpRight color={t.colors.accentText} size={22} strokeWidth={1.75} />
        </View>
      </View>

      <View
        style={[
          styles.row,
          styles.stats,
          { borderRadius: t.radius.control, backgroundColor: t.colors.surfaceSunken },
        ]}
      >
        <Stat
          label={CARD_COPY.price}
          value={
            station.pricePerKwhPaise !== null ? `${formatPaise(station.pricePerKwhPaise)}` : '—'
          }
        />
        <View style={[styles.split, { backgroundColor: t.colors.border }]} />
        <Stat
          label={CARD_COPY.power}
          value={station.maxPowerKw !== null ? `${station.maxPowerKw} kW` : '—'}
        />
        <View style={[styles.split, { backgroundColor: t.colors.border }]} />
        <Stat label={CARD_COPY.connectors} value={connectorSummary(station.connectorTypes)} />
      </View>
    </AppCard>
  );
};

export default StationCard;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  between: {
    justifyContent: 'space-between',
  },
  grow: {
    flex: 1,
    gap: 2,
  },
  go: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stats: {
    paddingVertical: 10,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  split: {
    width: StyleSheet.hairlineWidth,
    alignSelf: 'stretch',
  },
});
