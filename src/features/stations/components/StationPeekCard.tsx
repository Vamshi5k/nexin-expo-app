import { StyleSheet, View } from 'react-native';

import { ArrowUpRight } from 'lucide-react-native';

import { AppCard, AppStatusChip, AppText } from '@/shared/components';

import { useTheme } from '@/shared/theme';

import { MAP_COPY } from '../constants/stations.constants';
import type { StationPin } from '../types/stations.types';
import { pinColorKey, STATUS_LABEL } from '../utils/status';

type StationPeekCardProps = {
  pin: StationPin;
  onPress: (stationId: string) => void;
};

const StationPeekCard = ({ pin, onPress }: StationPeekCardProps) => {
  const t = useTheme();

  return (
    <AppCard
      elevation="elevated"
      onPress={() => onPress(pin.id)}
      accessibilityLabel={`${pin.name}, ${STATUS_LABEL[pin.status]}. ${MAP_COPY.viewDetails}`}
      style={{
        gap: t.space[3],
        padding: t.space[5],
        borderRadius: t.radius.sheet,
        borderColor: t.colors.accent,
        borderWidth: 1.5,
      }}
    >
      <AppStatusChip label={STATUS_LABEL[pin.status]} connector={pinColorKey(pin.status)} />
      <View style={[styles.row, { gap: t.space[3] }]}>
        <View style={styles.grow}>
          <AppText variant="title2" numberOfLines={1}>
            {pin.name}
          </AppText>
          <AppText variant="subhead" tone="accent">
            {MAP_COPY.viewDetails}
          </AppText>
        </View>
        <View
          style={[styles.go, { backgroundColor: t.colors.accentSoft, borderRadius: t.radius.pill }]}
        >
          <ArrowUpRight color={t.colors.accentText} size={22} strokeWidth={1.75} />
        </View>
      </View>
    </AppCard>
  );
};

export default StationPeekCard;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
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
});
