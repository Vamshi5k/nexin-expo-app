import Svg, { Circle, Path, Rect } from 'react-native-svg';

import type { ConnectorGlyphProps } from './types';

export default function Ccs2Glyph({ color, holeColor, size = 40 }: ConnectorGlyphProps) {
  return (
    <Svg viewBox="0 0 20 20" width={size} height={size}>
      {/* Top body OUTLINE instead of filled */}
      <Path
        d="M6.16 1.43h7.54c.42 0 .82.18 1.1.49.75.82 2.04 2.61 1.72 4.85-.39 2.75-3.04 5.03-6.34 5.09-3.12.2-5.86-1.75-6.56-4.45-.49-1.89.07-3.94 1.43-5.48.28-.32.69-.51 1.12-.51z"
        fill="none"
        stroke={color}
        strokeWidth={1}
      />
      {/* Bottom rectangle */}
      <Rect x={3.19} y={11.87} width={13.63} height={6.7} rx={3.35} ry={3.35} fill={color} />
      {/* Bottom large pins */}
      <Circle cx={13.43} cy={15.22} r={2.65} fill={holeColor} />
      <Circle cx={6.44} cy={15.22} r={2.65} fill={holeColor} />
      <Circle cx={13.43} cy={15.22} r={0.72} fill={color} />
      <Circle cx={6.44} cy={15.22} r={0.72} fill={color} />
      {/* Middle pins */}
      <Circle cx={9.93} cy={5.78} r={1.59} fill={color} />
      <Circle cx={12.08} cy={9.27} r={1.59} fill={color} />
      <Circle cx={7.9} cy={9.27} r={1.59} fill={color} />
      <Circle cx={5.84} cy={5.78} r={1.59} fill={color} />
      <Circle cx={14.01} cy={5.78} r={1.59} fill={color} />
      {/* Top small pins */}
      <Circle cx={12} cy={2.98} r={1.11} fill={color} />
      <Circle cx={7.84} cy={2.98} r={1.11} fill={color} />
      {/* Inner small dots */}
      <Circle cx={9.93} cy={5.78} r={0.58} fill={holeColor} />
      <Circle cx={14.01} cy={5.78} r={0.58} fill={holeColor} />
      <Circle cx={5.84} cy={5.78} r={0.57} fill={holeColor} />
      <Circle cx={7.9} cy={9.27} r={0.57} fill={holeColor} />
      <Circle cx={12.08} cy={9.27} r={0.58} fill={holeColor} />
      <Circle cx={12} cy={2.98} r={0.45} fill={holeColor} />
      <Circle cx={7.84} cy={2.98} r={0.45} fill={holeColor} />
    </Svg>
  );
}
