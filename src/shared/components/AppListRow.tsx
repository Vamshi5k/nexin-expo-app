import type { LucideIcon } from 'lucide-react-native';
import { ChevronRight } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { View } from 'react-native';

import { useTheme } from '@/shared/theme';

import type { HapticKind } from '@/shared/utils/haptics';
import AppPressable from './AppPressable';
import AppText from './AppText';

export const LIST_ICON_BOX = 32;

export type AppListRowProps = {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  iconTone?: 'accent' | 'neutral' | 'danger';
  value?: string;
  trailing?: ReactNode;
  chevron?: boolean;
  destructive?: boolean;
  onPress?: () => void;
  haptic?: HapticKind | false;
  accessibilityHint?: string;
};

export default function AppListRow({
  title,
  subtitle,
  icon: Icon,
  iconTone = 'accent',
  value,
  trailing,
  chevron,
  destructive,
  onPress,
  haptic = 'selection',
  accessibilityHint,
}: AppListRowProps) {
  const t = useTheme();
  const c = t.colors;
  const tone = destructive ? 'danger' : iconTone;
  const iconColors = {
    accent: { bg: c.accentSoft, fg: c.accentText },
    neutral: { bg: c.surfaceSunken, fg: c.textSecondary },
    danger: { bg: c.dangerSoft, fg: c.dangerText },
  }[tone];
  const showChevron = chevron ?? (!!onPress && !trailing);

  const content = (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        minHeight: subtitle ? 64 : 52,
        paddingHorizontal: t.space[4],
        paddingVertical: t.space[3],
        gap: t.space[3],
      }}
    >
      {Icon ? (
        <View
          style={{
            width: LIST_ICON_BOX,
            height: LIST_ICON_BOX,
            borderRadius: t.radius.pill,
            backgroundColor: iconColors.bg,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon color={iconColors.fg} size={18} strokeWidth={1.75} />
        </View>
      ) : null}
      <View style={{ flex: 1, gap: 2 }}>
        <AppText variant="body" tone={destructive ? 'danger' : 'primary'} numberOfLines={1}>
          {title}
        </AppText>
        {subtitle ? (
          <AppText variant="subhead" tone="secondary" numberOfLines={2}>
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {trailing ??
        (value ? (
          <AppText variant="callout" tone="secondary" tabular numberOfLines={1}>
            {value}
          </AppText>
        ) : null)}
      {showChevron ? <ChevronRight color={c.textTertiary} size={20} strokeWidth={1.75} /> : null}
    </View>
  );

  if (!onPress) return content;
  return (
    <AppPressable
      onPress={onPress}
      haptic={haptic}
      feedback="opacity"
      accessibilityLabel={subtitle ? `${title}, ${subtitle}` : title}
      accessibilityHint={accessibilityHint}
    >
      {content}
    </AppPressable>
  );
}
