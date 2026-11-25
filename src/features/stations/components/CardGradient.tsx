import { StyleSheet } from 'react-native';

import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

type CardGradientProps = {
  color: string;
  id: string;
};

// Most of the card in `color`, blending into white at the bottom edge. Extra stops ease the fade
// so there is no visible band.
const CardGradient = ({ color, id }: CardGradientProps) => (
  <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
    <Defs>
      <LinearGradient id={id} x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0" stopColor={color} stopOpacity={0.38} />
        <Stop offset="0.35" stopColor={color} stopOpacity={0.32} />
        <Stop offset="0.6" stopColor={color} stopOpacity={0.22} />
        <Stop offset="0.75" stopColor={color} stopOpacity={0.12} />
        <Stop offset="0.88" stopColor={color} stopOpacity={0.05} />
        <Stop offset="1" stopColor={color} stopOpacity={0} />
      </LinearGradient>
    </Defs>
    <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${id})`} />
  </Svg>
);

export default CardGradient;
