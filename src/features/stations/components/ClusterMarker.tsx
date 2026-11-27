import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Marker } from 'react-native-maps';

import { AppText } from '@/shared/components';

import { useTheme } from '@/shared/theme';

import { MARKER_TRACK_MS } from '../constants/stations.constants';
import type { Coordinates } from '../types/stations.types';

type ClusterMarkerProps = {
  clusterId: number;
  count: number;
  coordinate: Coordinates;
  onPress: (clusterId: number, coordinate: Coordinates) => void;
};

const ClusterMarker = ({ clusterId, count, coordinate, onPress }: ClusterMarkerProps) => {
  const t = useTheme();
  const [paintedCount, setPaintedCount] = useState<number | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setPaintedCount(count), MARKER_TRACK_MS);
    return () => clearTimeout(timer);
  }, [count]);

  const size = count < 10 ? 36 : count < 100 ? 44 : 52;

  return (
    <Marker
      coordinate={coordinate}
      tracksViewChanges={paintedCount !== count}
      onPress={() => onPress(clusterId, coordinate)}
      accessibilityLabel={`${count} stations`}
    >
      <View
        style={[
          styles.bubble,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: t.colors.accent,
            borderColor: t.colors.surface,
          },
        ]}
      >
        <AppText variant="subhead" tone="onAccent" tabular>
          {count}
        </AppText>
      </View>
    </Marker>
  );
};

export default ClusterMarker;

const styles = StyleSheet.create({
  bubble: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
  },
});
