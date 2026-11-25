import Svg, { Circle } from 'react-native-svg';

import type { ConnectorGlyphProps } from './types';

export default function BharatAcGlyph({ color, holeColor, size = 40 }: ConnectorGlyphProps) {
  return (
    <Svg viewBox="0 0 20 20" width={size} height={size}>
      {/* Outer Circle */}
      <Circle cx={10} cy={10} r={6.74} fill="none" stroke={color} strokeWidth={1} />
      {/* Left Pin */}
      <Circle cx={6.45} cy={8.36} r={1.26} fill={color} />
      <Circle cx={6.45} cy={8.36} r={0.58} fill={holeColor} />
      {/* Right Pin */}
      <Circle cx={13.46} cy={8.36} r={1.26} fill={color} />
      <Circle cx={13.46} cy={8.36} r={0.58} fill={holeColor} />
      {/* Bottom Pin */}
      <Circle cx={9.95} cy={13.33} r={1.26} fill={color} />
      <Circle cx={9.95} cy={13.33} r={0.58} fill={holeColor} />
    </Svg>
  );
}
