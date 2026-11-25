import { StyleSheet } from 'react-native';

import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

type BrandGradientProps = {
  id: string;
  from: string;
  to: string;
  fromOpacity?: number;
  toOpacity?: number;
  direction?: 'diagonal' | 'down';
};

// A two-colour wash that fills its parent. Colours come from theme tokens at the call site.
const BrandGradient = ({
  id,
  from,
  to,
  fromOpacity = 1,
  toOpacity = 1,
  direction = 'diagonal',
}: BrandGradientProps) => (
  <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
    <Defs>
      <LinearGradient id={id} x1="0" y1="0" x2={direction === 'diagonal' ? '1' : '0'} y2="1">
        <Stop offset="0" stopColor={from} stopOpacity={fromOpacity} />
        <Stop offset="1" stopColor={to} stopOpacity={toOpacity} />
      </LinearGradient>
    </Defs>
    <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${id})`} />
  </Svg>
);

export default BrandGradient;
