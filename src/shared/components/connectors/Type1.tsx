import Svg, { Circle } from 'react-native-svg';

import type { ConnectorGlyphProps } from './types';

export default function Type1Glyph({ color, holeColor, size = 40 }: ConnectorGlyphProps) {
  return (
    <Svg viewBox="0 0 20 20" width={size} height={size}>
      <Circle cx={10} cy={10} r={6.74} fill="none" stroke={color} strokeWidth={1} />
      {/* Bottom Large Pin */}
      <Circle cx={9.98} cy={12.76} r={1.52} fill={color} />
      <Circle cx={9.98} cy={12.76} r={0.69} fill={holeColor} />
      {/* Right Large Pin */}
      <Circle cx={12.7} cy={7.24} r={1.52} fill={color} />
      <Circle cx={12.7} cy={7.24} r={0.69} fill={holeColor} />
      {/* Left Large Pin */}
      <Circle cx={7.44} cy={7.24} r={1.52} fill={color} />
      <Circle cx={7.44} cy={7.24} r={0.69} fill={holeColor} />
      {/* Right Small Pin */}
      <Circle cx={13.14} cy={11} r={0.96} fill={color} />
      <Circle cx={13.14} cy={11} r={0.44} fill={holeColor} />
      {/* Left Small Pin */}
      <Circle cx={6.74} cy={11.05} r={0.96} fill={color} />
      <Circle cx={6.74} cy={11.05} r={0.44} fill={holeColor} />
    </Svg>
  );
}
