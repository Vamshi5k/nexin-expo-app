import Svg, { Circle, Ellipse, Path, Rect } from 'react-native-svg';

import { useTheme, withAlpha } from '@/shared/theme';

type VehicleArtProps = {
  width: number;
  // Faded, for a vehicle that can't be used right now.
  muted?: boolean;
};

const RATIO = 48 / 96;

// A side-view EV on a 96 x 48 grid: a soft brand-tinted body under a crisp outline, two windows,
// a door line, a headlight, wheels with hubs and a faint ground shadow. Theme colours only.
const VehicleArt = ({ width, muted }: VehicleArtProps) => {
  const t = useTheme();
  const ink = muted ? t.colors.textTertiary : t.colors.accentText;
  const body = withAlpha(muted ? t.colors.textTertiary : t.colors.accent, 0.22);
  const glass = t.colors.surface;
  const tyre = muted ? t.colors.textTertiary : t.colors.textPrimary;

  return (
    <Svg width={width} height={width * RATIO} viewBox="0 0 96 48" accessible={false}>
      <Ellipse cx={50} cy={45.5} rx={40} ry={2.2} fill={withAlpha(t.colors.textPrimary, 0.08)} />
      <Path
        d="M8 34c0-5 3-7 8-8l12-2 10-9c2-2 5-3 8-3h16c4 0 7 2 10 5l7 7 7 2c4 1 6 4 6 8v2c0 2-2 4-4 4H12c-2 0-4-2-4-4z"
        fill={body}
        stroke={ink}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
      <Path
        d="M47 15h8v9H38l6-6.5c.8-1.2 1.8-2.5 3-2.5z"
        fill={glass}
        stroke={ink}
        strokeWidth={1.4}
        strokeLinejoin="round"
      />
      <Path
        d="M58 15h4c2.6 0 4.4 1 6 3l5 6H58z"
        fill={glass}
        stroke={ink}
        strokeWidth={1.4}
        strokeLinejoin="round"
      />
      <Path d="M56.5 26v12" stroke={ink} strokeWidth={1.2} strokeLinecap="round" />
      <Rect x={85} y={28} width={5} height={3} rx={1.5} fill={muted ? glass : t.colors.accent} />
      <Circle cx={26} cy={40} r={7} fill={tyre} />
      <Circle cx={26} cy={40} r={3} fill={glass} />
      <Circle cx={74} cy={40} r={7} fill={tyre} />
      <Circle cx={74} cy={40} r={3} fill={glass} />
    </Svg>
  );
};

export default VehicleArt;
