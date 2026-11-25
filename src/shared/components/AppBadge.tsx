import { View } from 'react-native';

import { useTheme } from '@/shared/theme';

import AppText from './AppText';

export type AppBadgeProps = {
  label: string | number;
  tone?: 'accent' | 'neutral' | 'danger';
};

export default function AppBadge({ label, tone = 'accent' }: AppBadgeProps) {
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
      <AppText variant="caption" tabular style={{ color: palette.fg }}>
        {label}
      </AppText>
    </View>
  );
}
