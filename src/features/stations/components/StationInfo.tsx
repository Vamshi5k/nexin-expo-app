import { StyleSheet, View } from 'react-native';

import { MapPin } from 'lucide-react-native';

import { AppStatusChip, AppText } from '@/shared/components';

import StatRow, { type Stat } from './StatRow';

import { useTheme } from '@/shared/theme';

import { brand } from '@/core/config';
import { formatRate } from '@/shared/utils/money';

import { DETAILS_COPY, MAX_ETA_KM } from '../constants/stations.constants';
import type { StationDetails } from '../types/stations.types';
import { formatDistance, formatEta } from '../utils/geo';
import { pinColorKey, STATUS_LABEL } from '../utils/status';

type StationInfoProps = {
  station: StationDetails;
  distance: number | null;
};

const stationStats = (station: StationDetails, distance: number | null): Stat[] => {
  const powers = station.chargers.map(charger => charger.capacityKw).filter(isNumber);
  const prices = station.chargers.map(charger => charger.pricePerKwhPaise).filter(isNumber);

  const stats: (Stat | null)[] = [
    distance !== null
      ? { value: formatDistance(distance, brand.locale), label: DETAILS_COPY.distance }
      : null,
    distance !== null && distance <= MAX_ETA_KM
      ? { value: formatEta(distance), label: DETAILS_COPY.drive }
      : null,
    powers.length ? { value: `${Math.max(...powers)} kW`, label: DETAILS_COPY.power } : null,
    prices.length ? { value: formatRate(Math.min(...prices)), label: DETAILS_COPY.perKwh } : null,
  ];
  return stats.filter((stat): stat is Stat => stat !== null);
};

function isNumber(value: number | null): value is number {
  return value !== null;
}

const StationInfo = ({ station, distance }: StationInfoProps) => {
  const t = useTheme();
  const stats = stationStats(station, distance);

  return (
    <View style={{ gap: t.space[3], paddingHorizontal: t.layout.screenPadding }}>
      <AppStatusChip label={STATUS_LABEL[station.status]} connector={pinColorKey(station.status)} />
      <View style={{ gap: t.space[1] }}>
        <AppText variant="title2" accessibilityRole="header">
          {station.name}
        </AppText>
        {station.address ? (
          <View style={[styles.row, { gap: t.space[1] }]}>
            <MapPin color={t.colors.textTertiary} size={t.icon.meta} strokeWidth={t.icon.stroke} />
            <AppText variant="subhead" tone="secondary" style={styles.grow}>
              {station.address}
            </AppText>
          </View>
        ) : null}
      </View>
      {stats.length ? <StatRow stats={stats} /> : null}
    </View>
  );
};

export default StationInfo;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  grow: {
    flex: 1,
  },
});
