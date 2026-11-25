import type { LucideIcon } from 'lucide-react-native';
import { ChevronRight } from 'lucide-react-native';
import { Children, Fragment, isValidElement, type ReactNode } from 'react';
import { View } from 'react-native';

import { useTheme } from '@/shared/theme';

import type { HapticKind } from '@/shared/utils/haptics';
import { Pressable } from './Pressable';
import { Text } from './Text';

export type ListGroupProps = {
  title?: string;
  footer?: string;
  children: ReactNode;
};

const ICON_BOX = 32;

export function ListGroup({ title, footer, children }: ListGroupProps) {
  const t = useTheme();
  const rows = Children.toArray(children).filter(isValidElement);
  const hasIcons = rows.some(r => (r.props as Partial<ListRowProps>).icon != null);
  const inset = t.space[4] + (hasIcons ? ICON_BOX + t.space[3] : 0);

  return (
    <View style={{ gap: t.space[2] }}>
      {title ? (
        <Text
          variant="subhead"
          tone="secondary"
          accessibilityRole="header"
          style={{ paddingHorizontal: t.space[1] }}
        >
          {title}
        </Text>
      ) : null}
      <View
        style={{
          backgroundColor: t.colors.surface,
          borderRadius: t.radius.card,
          borderWidth: t.layout.hairline,
          borderColor: t.colors.border,
          overflow: 'hidden',
        }}
      >
        {rows.map((row, i) => (
          <Fragment key={row.key ?? i}>
            {i > 0 ? (
              <View
                style={{
                  height: t.layout.hairline,
                  marginLeft: inset,
                  backgroundColor: t.colors.border,
                }}
              />
            ) : null}
            {row}
          </Fragment>
        ))}
      </View>
      {footer ? (
        <Text variant="caption" tone="tertiary" style={{ paddingHorizontal: t.space[1] }}>
          {footer}
        </Text>
      ) : null}
    </View>
  );
}

export type ListRowProps = {
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

export function ListRow({
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
}: ListRowProps) {
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
            width: ICON_BOX,
            height: ICON_BOX,
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
        <Text variant="body" tone={destructive ? 'danger' : 'primary'} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="subhead" tone="secondary" numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {trailing ??
        (value ? (
          <Text variant="callout" tone="secondary" tabular numberOfLines={1}>
            {value}
          </Text>
        ) : null)}
      {showChevron ? <ChevronRight color={c.textTertiary} size={20} strokeWidth={1.75} /> : null}
    </View>
  );

  if (!onPress) return content;
  return (
    <Pressable
      onPress={onPress}
      haptic={haptic}
      feedback="opacity"
      accessibilityLabel={subtitle ? `${title}, ${subtitle}` : title}
      accessibilityHint={accessibilityHint}
    >
      {content}
    </Pressable>
  );
}
