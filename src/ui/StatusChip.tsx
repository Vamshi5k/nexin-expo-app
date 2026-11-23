import type { ConnectorStatus } from '@brand/schema';
import { View } from 'react-native';

import { useTheme, withAlpha } from '@/theme';

import { Text } from './Text';

export type StatusTone = 'success' | 'warning' | 'danger' | 'neutral' | 'accent';

export type StatusChipProps = {
  label: string;
  tone?: StatusTone;
  /** Use a connector status colour for the dot instead of a tone. */
  connector?: ConnectorStatus;
};

/** Soft tinted background + coloured dot + text. Colour is never the only signal. */
export function StatusChip({ label, tone = 'neutral', connector }: StatusChipProps) {
  const t = useTheme();
  const c = t.colors;
  const tones = {
    success: { bg: c.successSoft, dot: c.success, fg: c.successText },
    warning: { bg: c.warningSoft, dot: c.warning, fg: c.warningText },
    danger: { bg: c.dangerSoft, dot: c.danger, fg: c.dangerText },
    accent: { bg: c.accentSoft, dot: c.accent, fg: c.accentText },
    neutral: { bg: c.surfaceSunken, dot: c.textTertiary, fg: c.textSecondary },
  };
  const toneColors = tones[tone];
  const dot = connector ? c.connector[connector] : toneColors.dot;
  const bg = connector ? withAlpha(dot, t.scheme === 'light' ? 0.12 : 0.22) : toneColors.bg;
  const fg = connector ? c.textPrimary : toneColors.fg;

  return (
    <View
      accessibilityLabel={label}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        gap: t.space[2],
        paddingHorizontal: t.space[3],
        height: 28,
        borderRadius: t.radius.pill,
        backgroundColor: bg,
      }}
    >
      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: dot }} />
      <Text variant="caption" style={{ color: fg }}>
        {label}
      </Text>
    </View>
  );
}
