import Svg, { Circle, Path } from 'react-native-svg';

import type { ConnectorGlyphProps } from './types';

export default function Type2Glyph({ color, holeColor, size = 40 }: ConnectorGlyphProps) {
  return (
    <Svg viewBox="0 0 20 20" width={size} height={size}>
      <Path
        d="M6.03 4.6h7.79c.43 0 .85.18 1.14.51.77.85 2.11 2.69 1.77 5.02-.41 2.85-3.14 5.2-6.55 5.27-3.22.2-6.06-1.81-6.78-4.6-.51-1.95.07-4.08 1.47-5.66.29-.33.71-.52 1.15-.52z"
        fill="none"
        stroke={color}
        strokeWidth={0.39}
      />
      <Circle cx={9.93} cy={9.09} r={1.64} fill={color} />
      <Circle cx={12.15} cy={12.7} r={1.64} fill={color} />
      <Circle cx={7.83} cy={12.7} r={1.64} fill={color} />
      <Circle cx={5.7} cy={9.09} r={1.64} fill={color} />
      <Circle cx={14.14} cy={9.09} r={1.64} fill={color} />
      <Circle cx={12.07} cy={6.2} r={1.15} fill={color} />
      <Circle cx={7.76} cy={6.2} r={1.15} fill={color} />
      <Circle cx={9.93} cy={9.09} r={0.59} fill={holeColor} />
      <Circle cx={14.14} cy={9.09} r={0.59} fill={holeColor} />
      <Circle cx={5.7} cy={9.09} r={0.59} fill={holeColor} />
      <Circle cx={7.83} cy={12.7} r={0.59} fill={holeColor} />
      <Circle cx={12.15} cy={12.7} r={0.59} fill={holeColor} />
      <Circle cx={12.07} cy={6.2} r={0.47} fill={holeColor} />
      <Circle cx={7.76} cy={6.2} r={0.47} fill={holeColor} />
    </Svg>
  );
}
