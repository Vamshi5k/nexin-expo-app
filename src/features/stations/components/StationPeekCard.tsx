import { StyleSheet, View } from 'react-native';

import { ChevronRight } from 'lucide-react-native';

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
      onPress={() => onPress(pin.id)}
      accessibilityLabel={`${pin.name}, ${STATUS_LABEL[pin.status]}. ${MAP_COPY.viewDetails}`}
      style={{ gap: t.space[2], borderColor: t.colors.accent, borderWidth: 2 }}
    >
      <View style={[styles.row, { gap: t.space[2] }]}>
        <AppText variant="headline" numberOfLines={1} style={styles.grow}>
          {pin.name}
        </AppText>
        <ChevronRight color={t.colors.accentText} size={20} />
      </View>
      <View style={[styles.row, { gap: t.space[3] }]}>
        <AppStatusChip label={STATUS_LABEL[pin.status]} connector={pinColorKey(pin.status)} />
        <AppText variant="subhead" tone="accent">
          {MAP_COPY.viewDetails}
        </AppText>
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
  },
});
