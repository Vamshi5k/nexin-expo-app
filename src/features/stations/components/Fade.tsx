import { StyleSheet } from 'react-native';

import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

type FadeProps = {
  id: string;
  color: string;
  from: number;
  to: number;
  top?: boolean;
};

// A vertical colour fade that fills its parent: brand washes behind headers and the hero, and
// scrims over photos. `top` runs it top to bottom, otherwise bottom to top.
const Fade = ({ id, color, from, to, top }: FadeProps) => (
  <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
    <Defs>
      <LinearGradient id={id} x1="0" y1={top ? '0' : '1'} x2="0" y2={top ? '1' : '0'}>
        <Stop offset="0" stopColor={color} stopOpacity={from} />
        <Stop offset="1" stopColor={color} stopOpacity={to} />
      </LinearGradient>
    </Defs>
    <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${id})`} />
  </Svg>
);

export default Fade;
