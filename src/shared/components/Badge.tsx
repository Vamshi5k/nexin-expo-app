import { View } from 'react-native';

import { useTheme } from '@/shared/theme';

import { Text } from './Text';

export type BadgeProps = {
  label: string | number;
  tone?: 'accent' | 'neutral' | 'danger';
};

export function Badge({ label, tone = 'accent' }: BadgeProps) {
  const t = useTheme();
  const c = t.colors;
  const palette = {
    accent: { bg: c.accent, fg: c.onAccent },
    neutral: { bg: c.surfaceSunken, fg: c.textSecondary },
    danger: { bg: c.danger, fg: c.onDanger },
  }[tone];
  return (
    <View
      style={{
        minWidth: 20,
        height: 20,
        paddingHorizontal: t.space[2],
        borderRadius: t.radius.pill,
        backgroundColor: palette.bg,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'flex-start',
      }}
    >
      <Text variant="caption" tabular style={{ color: palette.fg }}>
        {label}
      </Text>
    </View>
  );
}
