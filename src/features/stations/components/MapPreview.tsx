import { StyleSheet, View } from 'react-native';

import { Zap } from 'lucide-react-native';
import Svg, { Line, Rect } from 'react-native-svg';

import { AppPressable, AppText } from '@/shared/components';

import { useTheme, withAlpha } from '@/shared/theme';

import { DETAILS_COPY } from '../constants/stations.constants';

type MapPreviewProps = {
  height: number;
  label: string | null;
  onPress: () => void;
};

// Where the pin sits, as shares of the preview's width and height.
const PIN = { x: 0.52, y: 0.45 };
const YOU = { x: 0.12, y: 0.7 };

// A drawn street-map hint, not a live map: a few roads, the route from you to the station and
// its pin. Tapping it opens directions.
const MapPreview = ({ height, label, onPress }: MapPreviewProps) => {
  const t = useTheme();
  const road = t.colors.surface;
  const pin = t.space[10];
  const halo = pin + t.space[4];

  return (
    <AppPressable
      onPress={onPress}
      feedback="opacity"
      accessibilityRole="button"
      accessibilityLabel={DETAILS_COPY.mapPreview}
      style={{ height, backgroundColor: t.colors.surfaceSunken }}
    >
      <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
        <Line x1="0%" y1="62%" x2="100%" y2="30%" stroke={road} strokeWidth={14} />
        <Line x1="34%" y1="0%" x2="24%" y2="100%" stroke={road} strokeWidth={12} />
        <Line x1="82%" y1="0%" x2="82%" y2="100%" stroke={road} strokeWidth={8} />
        <Line
          x1={`${YOU.x * 100 + 2}%`}
          y1={`${YOU.y * 100 - 3}%`}
          x2={`${PIN.x * 100}%`}
          y2={`${PIN.y * 100 + 6}%`}
          stroke={t.colors.accentText}
          strokeWidth={4}
          strokeLinecap="round"
        />
        <Rect
          x={`${YOU.x * 100}%`}
          y={`${YOU.y * 100}%`}
          width={18}
          height={18}
          rx={5}
          fill={t.colors.textPrimary}
        />
      </Svg>

      <View
        pointerEvents="none"
        style={[
          styles.center,
          styles.absolute,
          {
            left: `${PIN.x * 100}%`,
            top: `${PIN.y * 100}%`,
            width: halo,
            height: halo,
            marginLeft: -halo / 2,
            marginTop: -halo / 2,
            borderRadius: t.radius.pill,
            backgroundColor: withAlpha(t.colors.accent, 0.25),
          },
        ]}
      >
        <View
          style={[
            styles.center,
            {
              width: pin,
              height: pin,
              borderRadius: t.radius.pill,
              backgroundColor: t.colors.accent,
            },
          ]}
        >
          <Zap color={t.colors.onAccent} size={t.icon.control} strokeWidth={t.icon.stroke} />
        </View>
      </View>

      {label ? (
        <View
          pointerEvents="none"
          style={[
            styles.absolute,
            {
              top: t.space[3],
              right: t.space[3],
              paddingHorizontal: t.space[3],
              paddingVertical: t.space[1] + t.space[1] / 2,
              borderRadius: t.radius.pill,
              backgroundColor: t.colors.surface,
            },
          ]}
        >
          <AppText variant="subhead" tabular style={{ fontFamily: t.type.headline.fontFamily }}>
            {label}
          </AppText>
        </View>
      ) : null}
    </AppPressable>
  );
};

export default MapPreview;

const styles = StyleSheet.create({
  absolute: {
    position: 'absolute',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
