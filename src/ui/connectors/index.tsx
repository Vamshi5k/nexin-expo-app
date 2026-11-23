import { View } from 'react-native';

import { useTheme } from '@/theme';

import { Text } from '../Text';
import { BharatAcGlyph } from './BharatAc';
import { BharatDcGlyph } from './BharatDc';
import { Ccs1Glyph } from './Ccs1';
import { Ccs2Glyph } from './Ccs2';
import { ChademoGlyph } from './Chademo';
import { GbtGlyph } from './Gbt';
import { Type1Glyph } from './Type1';
import { Type2Glyph } from './Type2';
import { toConnectorType, type ConnectorGlyphProps, type ConnectorType } from './types';

export { CONNECTOR_TYPES, toConnectorType, type ConnectorType } from './types';

const GLYPHS: Record<ConnectorType, (p: ConnectorGlyphProps) => React.JSX.Element> = {
  CCS1: Ccs1Glyph,
  CCS2: Ccs2Glyph,
  CHAdeMO: ChademoGlyph,
  'Type 1': Type1Glyph,
  'Type 2': Type2Glyph,
  'Bharat AC-01': BharatAcGlyph,
  'Bharat DC-01': BharatDcGlyph,
  GBT: GbtGlyph,
};

export type ConnectorIconProps = {
  type: string;
  available?: boolean;
  size?: number;
  showLabel?: boolean;
};

export function ConnectorIcon({
  type,
  available = true,
  size = 40,
  showLabel,
}: ConnectorIconProps) {
  const t = useTheme();
  const known = toConnectorType(type);
  const Glyph = known ? GLYPHS[known] : Type2Glyph;
  const color = available ? t.colors.textSecondary : t.colors.textTertiary;
  return (
    <View
      accessibilityLabel={`${known ?? type} connector${available ? '' : ', unavailable'}`}
      style={{ alignItems: 'center', gap: t.space[1], opacity: available ? 1 : 0.6 }}
    >
      <Glyph color={color} holeColor={t.colors.surface} size={size} />
      {showLabel ? (
        <Text variant="caption" tone="secondary">
          {known ?? type}
        </Text>
      ) : null}
    </View>
  );
}
