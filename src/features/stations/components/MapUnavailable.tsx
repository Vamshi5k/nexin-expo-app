import { StyleSheet, View } from 'react-native';

import { MapPinned } from 'lucide-react-native';

import { AppText } from '@/shared/components';

import { useTheme } from '@/shared/theme';

import type { MapsSupport } from '@/core/maps';

import { MAP_COPY } from '../constants/stations.constants';

type MapUnavailableProps = {
  reason: Exclude<MapsSupport, 'ready'>;
};

const MapUnavailable = ({ reason }: MapUnavailableProps) => {
  const t = useTheme();

  return (
    <View
      style={[StyleSheet.absoluteFill, styles.center, { backgroundColor: t.colors.surfaceSunken }]}
    >
      <View style={[styles.copy, { gap: t.space[3], paddingHorizontal: t.space[8] }]}>
        <View
          style={[
            styles.icon,
            {
              width: t.space[12] + t.space[4],
              height: t.space[12] + t.space[4],
              backgroundColor: t.colors.accentSoft,
              borderRadius: t.radius.pill,
            },
          ]}
        >
          <MapPinned color={t.colors.accentText} size={t.icon.nav} strokeWidth={t.icon.stroke} />
        </View>
        <AppText variant="headline" align="center">
          {MAP_COPY.unavailableTitle}
        </AppText>
        <AppText variant="callout" tone="secondary" align="center">
          {reason === 'needs-key' ? MAP_COPY.unavailableKey : MAP_COPY.unavailableBuild}
        </AppText>
      </View>
    </View>
  );
};

export default MapUnavailable;

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    alignItems: 'center',
  },
  icon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
