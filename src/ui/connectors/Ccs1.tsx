import Svg, { Circle, Rect } from 'react-native-svg';

import type { ConnectorGlyphProps } from './types';

export function Ccs1Glyph({ color, holeColor, size = 40 }: ConnectorGlyphProps) {
  return (
    <Svg viewBox="0 0 20 20" width={size} height={size}>
      <Rect x={3.62} y={12.32} width={12.76} height={6.27} rx={3.14} ry={3.14} fill={color} />
      <Circle cx={13.21} cy={15.46} r={2.6} fill={holeColor} />
      <Circle cx={6.66} cy={15.46} r={2.6} fill={holeColor} />
      <Circle cx={13.21} cy={15.46} r={0.81} fill={color} />
      <Circle cx={6.66} cy={15.46} r={0.81} fill={color} />
      <Circle cx={7.96} cy={5.03} r={1.49} fill={color} />
      <Circle cx={7.96} cy={5.03} r={0.58} fill={holeColor} />
      <Circle cx={10} cy={9.84} r={1.49} fill={color} />
      <Circle cx={10} cy={9.84} r={0.58} fill={holeColor} />
      <Circle cx={12.27} cy={5.03} r={1.49} fill={color} />
      <Circle cx={12.27} cy={5.03} r={0.58} fill={holeColor} />
      <Circle cx={13.21} cy={8.36} r={1.05} fill={color} />
      <Circle cx={13.21} cy={8.36} r={0.45} fill={holeColor} />
      <Circle cx={6.98} cy={8.36} r={1.05} fill={color} />
      <Circle cx={6.98} cy={8.36} r={0.45} fill={holeColor} />
      <Circle cx={10} cy={6.86} r={5.46} fill="none" stroke={color} strokeWidth={1} />
    </Svg>
  );
}
