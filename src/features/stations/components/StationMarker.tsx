import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Zap } from 'lucide-react-native';
import { Marker } from 'react-native-maps';

import { useTheme, withAlpha } from '@/shared/theme';

import { MARKER_TRACK_MS } from '../constants/stations.constants';
import type { StationPin } from '../types/stations.types';
import { pinColorKey, STATUS_LABEL } from '../utils/status';

type StationMarkerProps = {
  pin: StationPin;
  selected: boolean;
  onPress: (pin: StationPin) => void;
};

const HALO_ALPHA = 0.25;

// Resting: a small status dot in a faint halo, so a busy map stays readable. Selected: a compact
// round pin with a bolt and a pointer; the station name is already on the card below.
const StationMarker = ({ pin, selected, onPress }: StationMarkerProps) => {
  const t = useTheme();
  const key = pinColorKey(pin.status);
  const fill = t.colors.connector[key];
  const ink = t.colors.onConnector[key];

  // Android redraws every custom marker each frame while tracking; stop once it has painted.
  const look = `${fill}-${selected}`;
  const [paintedLook, setPaintedLook] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setPaintedLook(look), MARKER_TRACK_MS);
    return () => clearTimeout(timer);
  }, [look]);

  const ring = t.space[1] / 2;
  const halo = t.space[6];
  const dot = t.space[4];
  const head = t.space[6] + t.space[1];

  return (
    <Marker
      coordinate={{ latitude: pin.latitude, longitude: pin.longitude }}
      anchor={selected ? { x: 0.5, y: 1 } : { x: 0.5, y: 0.5 }}
      tracksViewChanges={paintedLook !== look}
      zIndex={selected ? 2 : 1}
      onPress={() => onPress(pin)}
      accessibilityLabel={`${pin.name}, ${STATUS_LABEL[pin.status]}`}
    >
      {selected ? (
        <View style={styles.center}>
          <View
            style={[
              styles.center,
              {
                width: head,
                height: head,
                borderRadius: t.radius.pill,
                borderWidth: ring,
                borderColor: t.colors.surface,
                backgroundColor: fill,
              },
            ]}
          >
            <Zap color={ink} fill={ink} size={t.space[3]} strokeWidth={t.icon.stroke} />
          </View>
          <View
            style={[
              styles.tail,
              {
                marginTop: -ring,
                borderLeftWidth: t.space[1],
                borderRightWidth: t.space[1],
                borderTopWidth: t.space[1] + ring,
                borderTopColor: fill,
              },
            ]}
          />
        </View>
      ) : (
        <View
          style={[
            styles.center,
            {
              width: halo,
              height: halo,
              borderRadius: t.radius.pill,
              backgroundColor: withAlpha(fill, HALO_ALPHA),
            },
          ]}
        >
          <View
            style={{
              width: dot,
              height: dot,
              borderRadius: t.radius.pill,
              borderWidth: ring,
              borderColor: t.colors.surface,
              backgroundColor: fill,
            }}
          />
        </View>
      )}
    </Marker>
  );
};

export default StationMarker;

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tail: {
    width: 0,
    height: 0,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
});
