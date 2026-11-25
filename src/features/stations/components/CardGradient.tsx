import { StyleSheet } from 'react-native';

import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

type CardGradientProps = {
  color: string;
  id: string;
};

// A diagonal wash of `color` over the whole card: strongest top left, still tinted bottom right.
const CardGradient = ({ color, id }: CardGradientProps) => (
  <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
    <Defs>
      <LinearGradient id={id} x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0" stopColor={color} stopOpacity={0.32} />
        <Stop offset="0.6" stopColor={color} stopOpacity={0.16} />
        <Stop offset="1" stopColor={color} stopOpacity={0.1} />
      </LinearGradient>
    </Defs>
    <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${id})`} />
  </Svg>
);

export default CardGradient;
