import Svg, { Circle, Path } from 'react-native-svg';

import type { ConnectorGlyphProps } from './types';

export function BharatDcGlyph({ color, holeColor, size = 40 }: ConnectorGlyphProps) {
  return (
    <Svg viewBox="0 0 20 20" width={size} height={size}>
      <Circle cx={13.42} cy={9.7} r={1.26} fill={color} />
      <Circle cx={6.62} cy={9.7} r={1.26} fill={color} />
      <Circle cx={10} cy={12.07} r={1.26} fill={color} />
      <Circle cx={13.42} cy={9.7} r={0.58} fill={holeColor} />
      <Circle cx={6.62} cy={9.7} r={0.58} fill={holeColor} />
      <Circle cx={10} cy={12.07} r={0.57} fill={holeColor} />
      <Circle cx={10.02} cy={8.32} r={0.8} fill={color} />
      <Circle cx={10.02} cy={8.32} r={0.36} fill={holeColor} />
      <Circle cx={10.02} cy={5.54} r={0.8} fill={color} />
      <Circle cx={10.02} cy={5.54} r={0.36} fill={holeColor} />
      <Circle cx={12.52} cy={5.54} r={0.8} fill={color} />
      <Circle cx={12.52} cy={5.54} r={0.36} fill={holeColor} />
      <Circle cx={7.51} cy={5.54} r={0.8} fill={color} />
      <Circle cx={7.51} cy={5.54} r={0.36} fill={holeColor} />
      <Circle cx={6.16} cy={7.06} r={0.55} fill={color} />
      <Circle cx={6.16} cy={7.06} r={0.25} fill={holeColor} />
      <Circle cx={14} cy={7.06} r={0.55} fill={color} />
      <Circle cx={14} cy={7.06} r={0.25} fill={holeColor} />
      <Circle cx={11.97} cy={13.7} r={0.55} fill={color} />
      <Circle cx={11.97} cy={13.7} r={0.25} fill={holeColor} />
      <Circle cx={8.07} cy={13.7} r={0.55} fill={color} />
      <Circle cx={8.07} cy={13.7} r={0.25} fill={holeColor} />
      <Path
        d="M6.05 3.98h7.74c.43 0 .84.21 1.13.56.77.95 2.09 3 1.76 5.59-.41 3.17-3.12 5.79-6.51 5.86-3.2.23-6.02-2.02-6.74-5.13-.5-2.17.07-4.54 1.46-6.31.29-.37.71-.58 1.15-.58z"
        fill="none"
        stroke={color}
        strokeWidth={1}
      />
    </Svg>
  );
}
