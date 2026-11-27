import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { Marker } from 'react-native-maps';
import Svg, { Defs, G, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

import { useTheme } from '@/shared/theme';

import { MARKER_TRACK_MS } from '../constants/stations.constants';
import type { StationPin } from '../types/stations.types';
import { pinColorKey, STATUS_LABEL } from '../utils/status';

type StationMarkerProps = {
  pin: StationPin;
  selected: boolean;
  onPress: (pin: StationPin) => void;
};

// Share of the tile's corner radius, and of its width taken by the bolt.
const CORNER_RATIO = 0.3;
const ICON_RATIO = 0.5;

// Lucide's filled bolt on its 24 x 24 grid, drawn in the same SVG as the tile so Android's
// marker snapshot always includes it.
const BOLT_PATH =
  'M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z';
const BOLT_GRID = 24;

// A rounded-square tile in the station's status colour with a soft light-to-full gradient,
// a bolt and a short pointer. Selected tiles grow a step.
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
  const tile = selected ? t.space[8] : t.space[6];
  const tail = t.space[1] + t.space[1] / 2;
  const width = tile + ring * 2;
  const height = width + tail;
  const corner = tile * CORNER_RATIO;
  const gradientId = `station-pin-${pin.id}`;
  const bolt = tile * ICON_RATIO;
  const boltScale = bolt / BOLT_GRID;
  const boltOffset = (width - bolt) / 2;

  // Pointer under the tile, drawn as one path so the ring wraps it too.
  const mid = width / 2;
  const pointer = `M ${mid - tail} ${width - ring} L ${mid} ${height - ring} L ${mid + tail} ${width - ring} Z`;

  return (
    <Marker
      coordinate={{ latitude: pin.latitude, longitude: pin.longitude }}
      anchor={{ x: 0.5, y: 1 }}
      tracksViewChanges={paintedLook !== look}
      zIndex={selected ? 2 : 1}
      onPress={() => onPress(pin)}
      accessibilityLabel={`${pin.name}, ${STATUS_LABEL[pin.status]}`}
    >
      <View style={{ width, height }}>
        <Svg width={width} height={height}>
          <Defs>
            <LinearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor={t.colors.surface} stopOpacity={0.45} />
              <Stop offset="0.55" stopColor={t.colors.surface} stopOpacity={0.1} />
              <Stop offset="1" stopColor={t.colors.surface} stopOpacity={0} />
            </LinearGradient>
          </Defs>
          <Path d={pointer} fill={fill} stroke={t.colors.surface} strokeWidth={ring} />
          <Rect
            x={ring / 2}
            y={ring / 2}
            width={tile + ring}
            height={tile + ring}
            rx={corner + ring / 2}
            fill={fill}
            stroke={t.colors.surface}
            strokeWidth={ring}
          />
          <Rect
            x={ring}
            y={ring}
            width={tile}
            height={tile}
            rx={corner}
            fill={`url(#${gradientId})`}
          />
          <G transform={`translate(${boltOffset} ${boltOffset}) scale(${boltScale})`}>
            <Path d={BOLT_PATH} fill={ink} />
          </G>
        </Svg>
      </View>
    </Marker>
  );
};

export default StationMarker;
