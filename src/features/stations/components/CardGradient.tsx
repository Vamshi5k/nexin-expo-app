import { StyleSheet } from 'react-native';

import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

type CardGradientProps = {
  color: string;
  id: string;
};

// A soft wash of `color` at the top that fades out to the card surface underneath.
const CardGradient = ({ color, id }: CardGradientProps) => (
  <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
    <Defs>
      <LinearGradient id={id} x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0" stopColor={color} stopOpacity={0.3} />
        <Stop offset="0.55" stopColor={color} stopOpacity={0.08} />
        <Stop offset="1" stopColor={color} stopOpacity={0} />
      </LinearGradient>
    </Defs>
    <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${id})`} />
  </Svg>
);

export default CardGradient;
