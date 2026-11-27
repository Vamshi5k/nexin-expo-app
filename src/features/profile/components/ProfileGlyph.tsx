import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { withAlpha } from '@/shared/theme';

export type ProfileGlyphName =
  'car' | 'history' | 'heart' | 'support' | 'logout' | 'delete' | 'bell';

type ProfileGlyphProps = {
  name: ProfileGlyphName;
  color: string;
  size: number;
};

const STROKE = 1.6;

// The Profile screen's own duotone icons, drawn on a 24 x 24 grid: a soft fill in the ink's
// colour under a crisp outline. Colours come from the caller, so every brand gets its own.
const ProfileGlyph = ({ name, color, size }: ProfileGlyphProps) => {
  const soft = withAlpha(color, 0.2);
  const line = {
    stroke: color,
    strokeWidth: STROKE,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" accessible={false}>
      {name === 'car' ? (
        <>
          <Path
            d="M3 14.5v-2.2c0-.6.2-1.2.6-1.7l1.9-2.6a3 3 0 0 1 2.4-1.2h8.2a3 3 0 0 1 2.4 1.2l1.9 2.6c.4.5.6 1.1.6 1.7v2.2a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 14.5z"
            fill={soft}
            {...line}
          />
          <Path d="M6.2 10.4h11.6" {...line} />
          <Circle cx={7.5} cy={16.5} r={1.9} fill={color} />
          <Circle cx={16.5} cy={16.5} r={1.9} fill={color} />
        </>
      ) : null}

      {name === 'history' ? (
        <>
          <Circle cx={12} cy={12} r={8.5} fill={soft} {...line} />
          <Path d="M12.9 6.8 9.6 12.4h2.8l-1.1 4.8 3.6-6h-2.8l.8-4.4z" fill={color} />
        </>
      ) : null}

      {name === 'heart' ? (
        <Path
          d="M12 19.6s-7.5-4.4-7.5-9.7A4.1 4.1 0 0 1 12 7.6a4.1 4.1 0 0 1 7.5 2.3c0 5.3-7.5 9.7-7.5 9.7z"
          fill={soft}
          {...line}
        />
      ) : null}

      {name === 'support' ? (
        <>
          <Path d="M5 13.5V12a7 7 0 0 1 14 0v1.5" fill="none" {...line} />
          <Rect x={3.8} y={12.4} width={3.6} height={5.4} rx={1.8} fill={soft} {...line} />
          <Rect x={16.6} y={12.4} width={3.6} height={5.4} rx={1.8} fill={soft} {...line} />
          <Path d="M18.4 17.8c0 1.5-1.7 2.4-3.7 2.4h-1.6" fill="none" {...line} />
        </>
      ) : null}

      {name === 'logout' ? (
        <>
          <Path
            d="M10.5 4.5H6.8A1.8 1.8 0 0 0 5 6.3v11.4a1.8 1.8 0 0 0 1.8 1.8h3.7z"
            fill={soft}
            {...line}
          />
          <Path d="M14.5 8 18.5 12l-4 4M18.5 12H9.8" fill="none" {...line} />
        </>
      ) : null}

      {name === 'delete' ? (
        <>
          <Path
            d="M6.4 7.2 7.2 18a2 2 0 0 0 2 1.9h5.6a2 2 0 0 0 2-1.9l.8-10.8z"
            fill={soft}
            {...line}
          />
          <Path
            d="M4.5 7.2h15M9.6 7.2V5.6A1.6 1.6 0 0 1 11.2 4h1.6a1.6 1.6 0 0 1 1.6 1.6v1.6M10.6 11v5M13.4 11v5"
            fill="none"
            {...line}
          />
        </>
      ) : null}

      {name === 'bell' ? (
        <>
          <Path d="M6 16.2v-4.7a6 6 0 0 1 12 0v4.7l1.6 1.8H4.4z" fill={soft} {...line} />
          <Path d="M10 20.2a2 2 0 0 0 4 0" fill="none" {...line} />
        </>
      ) : null}
    </Svg>
  );
};

export default ProfileGlyph;
