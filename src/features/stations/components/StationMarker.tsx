import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Zap } from 'lucide-react-native';
import { Marker } from 'react-native-maps';

import { useTheme } from '@/shared/theme';

import { MARKER_TRACK_MS } from '../constants/stations.constants';
import type { StationPin } from '../types/stations.types';
import { pinColorKey, STATUS_LABEL } from '../utils/status';

type StationMarkerProps = {
  pin: StationPin;
  selected: boolean;
  onPress: (pin: StationPin) => void;
};

const StationMarker = ({ pin, selected, onPress }: StationMarkerProps) => {
  const t = useTheme();
  const color = t.colors.connector[pinColorKey(pin.status)];

  // Android redraws every custom marker each frame while tracking; stop once it has painted.
  const look = `${color}-${selected}`;
  const [paintedLook, setPaintedLook] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setPaintedLook(look), MARKER_TRACK_MS);
    return () => clearTimeout(timer);
  }, [look]);

  const size = selected ? 40 : 30;

  return (
    <Marker
      coordinate={{ latitude: pin.latitude, longitude: pin.longitude }}
      anchor={{ x: 0.5, y: 1 }}
      tracksViewChanges={paintedLook !== look}
      zIndex={selected ? 2 : 1}
      onPress={() => onPress(pin)}
      accessibilityLabel={`${pin.name}, ${STATUS_LABEL[pin.status]}`}
    >
      <View style={styles.wrap}>
        <View
          style={[
            styles.head,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: color,
              borderColor: t.colors.surface,
            },
          ]}
        >
          <Zap color={t.colors.surface} fill={t.colors.surface} size={size * 0.45} />
        </View>
        <View style={[styles.tail, { borderTopColor: color }]} />
      </View>
    </Marker>
  );
};

export default StationMarker;

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
  },
  head: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  tail: {
    width: 0,
    height: 0,
    marginTop: -1,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
});
