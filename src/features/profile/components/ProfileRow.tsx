import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { ChevronRight } from 'lucide-react-native';

import { AppPressable, AppSkeleton, AppText } from '@/shared/components';

import { useTheme } from '@/shared/theme';

type ProfileRowProps = {
  icon: ReactNode;
  title: string;
  subtitle?: string | null;
  loading?: boolean;
  tone?: 'accent' | 'neutral' | 'danger';
  chevron?: boolean;
  first?: boolean;
  // A control on the right (a switch), shown in place of the chevron.
  trailing?: ReactNode;
  onPress?: () => void;
};

// A compact row: an icon tile tinted by tone, the title over a quiet subtitle (or a skeleton
// while it loads), and a chevron. Rows after the first get a hairline inset past the tile.
const ProfileRow = ({
  icon,
  title,
  subtitle,
  loading,
  tone = 'accent',
  chevron = true,
  first,
  trailing,
  onPress,
}: ProfileRowProps) => {
  const t = useTheme();
  const tile = t.space[8] + t.space[1];
  const tiles = {
    accent: t.colors.accentSoft,
    neutral: t.colors.surfaceSunken,
    danger: t.colors.dangerSoft,
  };

  return (
    <AppPressable
      onPress={onPress}
      feedback="opacity"
      haptic="selection"
      accessibilityRole="button"
      accessibilityLabel={subtitle ? `${title}, ${subtitle}` : title}
      style={[styles.row, { gap: t.space[3], minHeight: t.layout.minTouch + t.space[3] }]}
    >
      <View
        style={[
          styles.center,
          {
            width: tile,
            height: tile,
            borderRadius: t.radius.control,
            backgroundColor: tiles[tone],
          },
        ]}
      >
        {icon}
      </View>

      <View
        style={[
          styles.row,
          styles.grow,
          {
            gap: t.space[2],
            alignSelf: 'stretch',
            borderTopWidth: first ? 0 : t.layout.hairline,
            borderTopColor: t.colors.border,
          },
        ]}
      >
        <View style={[styles.grow, { gap: t.space[1] / 2, paddingVertical: t.space[3] }]}>
          <AppText
            variant="subhead"
            numberOfLines={1}
            style={{
              fontFamily: t.type.headline.fontFamily,
              color: tone === 'danger' ? t.colors.dangerText : t.colors.textPrimary,
            }}
          >
            {title}
          </AppText>
          {loading ? (
            <AppSkeleton width={t.space[12] + t.space[8]} height={t.space[2] + t.space[1]} />
          ) : subtitle ? (
            <AppText variant="caption" tone="secondary" numberOfLines={1}>
              {subtitle}
            </AppText>
          ) : null}
        </View>
        {trailing ? (
          // iOS 26 draws its switch larger than the size RN measures, so it gets a fixed box,
          // centred on the row and ending where the chevrons do.
          <View style={[styles.center, { minWidth: t.space[12] + t.space[2], height: t.space[8] }]}>
            {trailing}
          </View>
        ) : null}
        {chevron && !trailing ? (
          <ChevronRight
            color={t.colors.textTertiary}
            size={t.icon.meta}
            strokeWidth={t.icon.stroke}
          />
        ) : null}
      </View>
    </AppPressable>
  );
};

export default ProfileRow;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  grow: {
    flex: 1,
  },
});
