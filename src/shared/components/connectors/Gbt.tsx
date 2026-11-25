import Svg, { Circle, Path } from 'react-native-svg';

import type { ConnectorGlyphProps } from './types';

export function GbtGlyph({ color, holeColor, size = 40 }: ConnectorGlyphProps) {
  return (
    <Svg viewBox="0 0 20 20" width={size} height={size}>
      {/* Outer Shape */}
      <Path
        d="M6.05 3.98h7.74c.43 0 .84.21 1.13.56.77.95 2.09 3 1.76 5.59-.41 3.17-3.12 5.79-6.51 5.86-3.2.23-6.02-2.02-6.74-5.13-.5-2.17.07-4.54 1.46-6.31.29-.37.71-.58 1.15-.58z"
        fill="none"
        stroke={color}
        strokeWidth={0.38}
      />
      {/* Top Pins */}
      <Circle cx={10} cy={7.92} r={0.75} fill={color} />
      <Circle cx={10} cy={5.8} r={0.75} fill={color} />
      <Circle cx={11.99} cy={5.8} r={0.75} fill={color} />
      <Circle cx={7.93} cy={5.8} r={0.75} fill={color} />
      {/* Bottom Pins */}
      <Circle cx={7.49} cy={13.07} r={0.75} fill={color} />
      <Circle cx={12.54} cy={13.07} r={0.75} fill={color} />
      {/* Center Large */}
      <Circle cx={10.02} cy={13.07} r={1.13} fill={color} />
      {/* Side Connectors */}
      <Circle cx={12.93} cy={9.81} r={1.77} fill={color} />
      <Circle cx={7.18} cy={9.81} r={1.77} fill={color} />
      {/* Inner Holes */}
      <Circle cx={7.18} cy={9.81} r={0.92} fill={holeColor} />
      <Circle cx={12.93} cy={9.81} r={0.92} fill={holeColor} />
    </Svg>
  );
}
