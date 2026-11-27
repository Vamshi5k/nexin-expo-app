import Svg, { Circle, Path } from 'react-native-svg';

import { withAlpha } from '@/shared/theme';

type VehicleGlyphProps = {
  color: string;
  size: number;
};

// A duotone car on a 24 x 24 grid, in the Profile icon style: a soft fill under a crisp line.
const VehicleGlyph = ({ color, size }: VehicleGlyphProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" accessible={false}>
    <Path
      d="M3 14.5v-2.2c0-.6.2-1.2.6-1.7l1.9-2.6a3 3 0 0 1 2.4-1.2h8.2a3 3 0 0 1 2.4 1.2l1.9 2.6c.4.5.6 1.1.6 1.7v2.2a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 14.5z"
      fill={withAlpha(color, 0.2)}
      stroke={color}
      strokeWidth={1.6}
      strokeLinejoin="round"
    />
    <Path d="M6.2 10.4h11.6" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
    <Circle cx={7.5} cy={16.5} r={1.9} fill={color} />
    <Circle cx={16.5} cy={16.5} r={1.9} fill={color} />
  </Svg>
);

export default VehicleGlyph;
