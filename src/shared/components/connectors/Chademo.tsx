import Svg, { Circle, Path } from 'react-native-svg';

import type { ConnectorGlyphProps } from './types';

export default function ChademoGlyph({ color, holeColor, size = 40 }: ConnectorGlyphProps) {
  return (
    <Svg viewBox="0 0 20 20" width={size} height={size}>
      {/* Outer Connector Shape */}
      <Path
        d="M4.76 5.87l-.17-.7-.02-.08L5.9 3.85a.59.59 0 01.55-.14l.79.21c.49-.24 1.39-.59 2.58-.62a6.31 6.31 0 012.65.53c.12.05.26.07.39.04l.65-.16c.2-.05.41 0 .56.15l1.25 1.25v.77c.18.24 2.22 3.07 1.06 6.39-.94 2.7-3.6 4.58-6.52 4.5-3.37-.09-6.03-2.75-6.49-5.74-.4-2.64 1.05-4.68 1.4-5.15z"
        fill="none"
        stroke={color}
        strokeWidth={0.38}
      />
      {/* Top small pins */}
      <Circle cx={10.01} cy={5.1} r={0.25} fill={color} />
      <Circle cx={10.01} cy={7.51} r={0.25} fill={color} />
      <Circle cx={11.23} cy={6.3} r={0.25} fill={color} />
      <Circle cx={8.85} cy={6.3} r={0.25} fill={color} />
      {/* Top connector shape */}
      <Path
        d="M10.19 6.74a.26.26 0 00-.38 0l-.88.88c.04.05.42.51 1.05.5.61 0 .96-.44 1.01-.5l-.81-.87zM10.22 5.92a.26.26 0 01-.38 0l-.88-.88c.04-.05.42-.51 1.05-.5.61 0 .96.44 1.01.5l-.81.87zM10.41 6.52a.26.26 0 010-.38l.88-.88c.05.04.51.42.5 1.05 0 .61-.44.96-.5 1.01l-.87-.81zM9.61 6.52a.26.26 0 000-.38l-.88-.88c-.05.04-.51.42-.5 1.05 0 .61.44.96.5 1.01l.87-.81z"
        fill={color}
      />
      {/* Bottom small pins */}
      <Circle cx={10.01} cy={12.75} r={0.25} fill={color} />
      <Circle cx={10.01} cy={15.16} r={0.25} fill={color} />
      <Circle cx={11.23} cy={13.95} r={0.25} fill={color} />
      <Circle cx={8.85} cy={13.95} r={0.25} fill={color} />
      {/* Bottom connector shape */}
      <Path
        d="M10.19 14.38a.26.26 0 00-.38 0l-.88.88c.04.05.42.51 1.05.5.61 0 .96-.44 1.01-.5l-.81-.87zM10.22 13.56a.26.26 0 01-.38 0l-.88-.88c.04-.05.42-.51 1.05-.5.61 0 .96.44 1.01.5l-.81.87zM10.41 14.17a.26.26 0 010-.38l.88-.88c.05.04.51.42.5 1.05 0 .61-.44.96-.5 1.01l-.87-.81zM9.61 14.17a.26.26 0 000-.38l-.88-.88c-.05.04-.51.42-.5 1.05 0 .61.44.96.5 1.01l.87-.81z"
        fill={color}
      />
      {/* Side connectors */}
      <Circle cx={6.91} cy={10.13} r={1.77} fill={color} />
      <Circle cx={6.91} cy={10.13} r={0.92} fill={holeColor} />
      <Circle cx={13.27} cy={10.13} r={1.77} fill={color} />
      <Circle cx={13.27} cy={10.13} r={0.92} fill={holeColor} />
    </Svg>
  );
}
