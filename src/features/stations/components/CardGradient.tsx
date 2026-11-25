import { StyleSheet } from 'react-native';

import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

type CardGradientProps = {
  color: string;
  id: string;
};

// Top half in `color`, bottom half white. Extra stops ease the fade so there is no visible band.
const CardGradient = ({ color, id }: CardGradientProps) => (
  <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
    <Defs>
      <LinearGradient id={id} x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0" stopColor={color} stopOpacity={0.34} />
        <Stop offset="0.3" stopColor={color} stopOpacity={0.26} />
        <Stop offset="0.45" stopColor={color} stopOpacity={0.16} />
        <Stop offset="0.55" stopColor={color} stopOpacity={0.07} />
        <Stop offset="0.65" stopColor={color} stopOpacity={0.02} />
        <Stop offset="0.75" stopColor={color} stopOpacity={0} />
      </LinearGradient>
    </Defs>
    <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${id})`} />
  </Svg>
);

export default CardGradient;
