import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { useTheme, withAlpha } from '@/shared/theme';

type ChargerArtProps = {
  size: number;
};

// A flat DC charger with its cable, drawn from theme colours so every brand gets its own.
// Coordinates are in the 120 x 120 drawing space of the viewBox.
const ChargerArt = ({ size }: ChargerArtProps) => {
  const t = useTheme();
  const ink = t.colors.onAccent;

  return (
    <Svg width={size} height={size} viewBox="0 0 120 120">
      <Circle cx={74} cy={64} r={52} fill={withAlpha(t.colors.surface, 0.14)} />
      <Rect x={30} y={18} width={52} height={88} rx={12} fill={t.colors.surface} />
      <Rect x={30} y={18} width={52} height={18} rx={12} fill={withAlpha(ink, 0.9)} />
      <Rect x={30} y={30} width={52} height={6} fill={withAlpha(ink, 0.9)} />
      <Rect x={39} y={44} width={34} height={26} rx={6} fill={withAlpha(ink, 0.9)} />
      <Path d="M58 48 L50 58 H56 L54 66 L62 56 H56 Z" fill={t.colors.accent} />
      <Rect x={39} y={78} width={34} height={4} rx={2} fill={t.colors.accent} />
      <Rect x={39} y={86} width={22} height={4} rx={2} fill={withAlpha(ink, 0.25)} />
      <Rect x={24} y={104} width={64} height={6} rx={3} fill={withAlpha(ink, 0.9)} />
      <Path
        d="M82 52 C98 52 102 66 100 80 C98 94 104 100 112 100"
        stroke={withAlpha(ink, 0.9)}
        strokeWidth={4}
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
};

export default ChargerArt;
