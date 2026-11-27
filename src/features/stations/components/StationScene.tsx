import Svg, { Circle, G, Path, Rect } from 'react-native-svg';

import { useTheme, withAlpha } from '@/shared/theme';

import { DETAILS_COPY } from '../constants/stations.constants';

type ChargerProps = {
  x: number;
  holsterSide: 'left' | 'right';
};

type CarProps = {
  transform: string;
};

// Drawn in a 400 x 112 slice (y 40 to 152) of a 400-wide canvas; the cars run off both edges.
const VIEW_BOX = '0 40 400 112';
const GROUND = 146;
const CHARGER = { top: 56, width: 40, height: 84 };

// Side profile with the nose at x = 0, facing left. Sill at y 128, wheels at x 30 and 134.
const CAR_BODY =
  'M0 124 C-2 116 0 108 8 105 L44 100 L62 86 C70 79 80 76 92 76 L124 76 C138 76 148 82 154 92 L162 104 C168 106 170 112 170 120 V124 C170 127 168 128 165 128 H151 A17 17 0 0 0 117 128 H47 A17 17 0 0 0 13 128 H4 C1 128 0 127 0 124 Z';
const CAR_GLASS = 'M54 100 L68 88 C74 83 81 81 90 81 L120 81 C131 81 140 86 145 94 L149 100 Z';
const WHEELS = [30, 134];

// Each charger's cable runs from its holster to the charge port on the car's front fender.
const CABLES = ['M156 98 C144 134 128 130 122 108', 'M244 98 C256 134 272 130 278 108'];

const Charger = ({ x, holsterSide }: ChargerProps) => {
  const t = useTheme();
  const c = t.colors;
  const { top, width, height } = CHARGER;
  const holsterX = holsterSide === 'left' ? x - 4 : x + width - 2;

  return (
    <G>
      <Rect
        x={x}
        y={top}
        width={width}
        height={height}
        rx={9}
        fill={c.surface}
        stroke={c.border}
        strokeWidth={1.5}
      />
      <Path
        d={`M${x} ${top + 9} Q${x} ${top} ${x + 9} ${top} H${x + width - 9} Q${x + width} ${top} ${x + width} ${top + 9} V${top + 14} H${x} Z`}
        fill={c.accent}
      />
      <Rect x={x + 7} y={top + 20} width={26} height={20} rx={4} fill={c.textPrimary} />
      <Path
        d={`M${x + 21.5} ${top + 23} L${x + 16} ${top + 31} H${x + 20} L${x + 18.5} ${top + 37} L${x + 24} ${top + 29} H${x + 20} Z`}
        fill={c.accent}
      />
      <Rect x={x + 7} y={top + 46} width={26} height={3} rx={1.5} fill={c.accent} />
      <Rect x={x + 7} y={top + 53} width={16} height={3} rx={1.5} fill={c.border} />
      <Rect x={holsterX} y={top + 36} width={6} height={14} rx={2} fill={c.textPrimary} />
    </G>
  );
};

const Car = ({ transform }: CarProps) => {
  const t = useTheme();
  const c = t.colors;

  return (
    <G transform={transform}>
      <Path d={CAR_BODY} fill={c.textPrimary} />
      <Path d={CAR_GLASS} fill={c.surface} opacity={0.22} />
      <Path d="M100 81 V100" stroke={c.textPrimary} strokeWidth={3} />
      <Path d="M10 112 H160" stroke={c.accent} strokeWidth={1.5} strokeLinecap="round" />
      <Rect x={2} y={107} width={9} height={3} rx={1.5} fill={c.accent} />
      <Rect x={16} y={102} width={8} height={7} rx={2} fill={c.accent} />
      {WHEELS.map(cx => (
        <G key={cx}>
          <Circle cx={cx} cy={128} r={15} fill={c.textPrimary} />
          <Circle cx={cx} cy={128} r={9} fill={c.surface} opacity={0.85} />
          <Circle cx={cx} cy={128} r={3} fill={c.accent} />
        </G>
      ))}
    </G>
  );
};

// The no-photo hero: two chargers on an island, each plugged into a car. Theme colours only,
// so every brand gets its own version.
const StationScene = () => {
  const t = useTheme();
  const c = t.colors;

  return (
    <Svg
      width="100%"
      height="100%"
      viewBox={VIEW_BOX}
      preserveAspectRatio="xMidYMax meet"
      accessible
      accessibilityRole="image"
      accessibilityLabel={DETAILS_COPY.illustration}
    >
      <Circle cx={200} cy={100} r={64} fill={withAlpha(c.accent, 0.14)} />
      <Rect
        x={0}
        y={GROUND}
        width={400}
        height={3}
        rx={1.5}
        fill={withAlpha(c.textPrimary, 0.08)}
      />

      <Car transform="translate(138 0) scale(-1 1)" />
      <Car transform="translate(262 0)" />

      <Rect x={146} y={140} width={108} height={7} rx={3} fill={c.textPrimary} />
      <Charger x={156} holsterSide="left" />
      <Charger x={204} holsterSide="right" />

      {CABLES.map(d => (
        <Path
          key={d}
          d={d}
          fill="none"
          stroke={c.textPrimary}
          strokeWidth={3.5}
          strokeLinecap="round"
        />
      ))}
    </Svg>
  );
};

export default StationScene;
