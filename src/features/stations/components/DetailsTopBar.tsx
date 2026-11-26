import { StyleSheet, View } from 'react-native';

import { ChevronLeft, Heart, Share2, type LucideIcon } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppGlass, AppPressable, AppText } from '@/shared/components';

import { mapTopBarHeight } from './MapTopBar';

import { useTheme, type Theme } from '@/shared/theme';

import { DETAILS_COPY } from '../constants/stations.constants';

type DetailsTopBarProps = {
  title: string | null;
  isFavourite: boolean;
  onBack: () => void;
  onShare: (() => void) | null;
  onToggleFavourite: (() => void) | null;
};

type CapsuleButtonProps = {
  icon: LucideIcon;
  label: string;
  onPress: () => void;
  active?: boolean;
};

export const topBarSpace = (t: Theme, topInset: number) =>
  topInset + t.space[2] + mapTopBarHeight(t) + t.space[4];

const CapsuleButton = ({ icon: Icon, label, onPress, active }: CapsuleButtonProps) => {
  const t = useTheme();
  const color = active ? t.colors.danger : t.colors.textPrimary;

  return (
    <AppPressable
      onPress={onPress}
      haptic="light"
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={active === undefined ? undefined : { selected: active }}
      style={[
        styles.center,
        { width: t.layout.minTouch, height: t.layout.minTouch, borderRadius: t.radius.pill },
      ]}
    >
      <Icon
        color={color}
        fill={active ? color : 'transparent'}
        size={t.icon.control}
        strokeWidth={t.icon.stroke}
      />
    </AppPressable>
  );
};

// The map's search capsule, reused as the details header; the page scrolls under the glass.
const DetailsTopBar = ({
  title,
  isFavourite,
  onBack,
  onShare,
  onToggleFavourite,
}: DetailsTopBarProps) => {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const height = mapTopBarHeight(t);
  const inset = (height - t.layout.minTouch) / 2;

  return (
    <>
      {/* Keeps scrolled content out from under the clock and status icons. */}
      <View
        pointerEvents="none"
        style={[styles.statusStrip, { height: insets.top, backgroundColor: t.colors.bg }]}
      />
      <View
        pointerEvents="box-none"
        style={[styles.wrap, { top: insets.top + t.space[2], paddingHorizontal: t.space[4] }]}
      >
        <AppGlass
          radius={t.radius.pill}
          style={[styles.row, { height, paddingHorizontal: inset, gap: t.space[1] }]}
        >
          <CapsuleButton icon={ChevronLeft} label={DETAILS_COPY.back} onPress={onBack} />
          <AppText variant="headline" numberOfLines={1} style={styles.grow}>
            {title ?? ''}
          </AppText>
          {onShare ? (
            <CapsuleButton icon={Share2} label={DETAILS_COPY.share} onPress={onShare} />
          ) : null}
          {onToggleFavourite ? (
            <CapsuleButton
              icon={Heart}
              label={isFavourite ? DETAILS_COPY.removeFavourite : DETAILS_COPY.addFavourite}
              onPress={onToggleFavourite}
              active={isFavourite}
            />
          ) : null}
        </AppGlass>
      </View>
    </>
  );
};

export default DetailsTopBar;

const styles = StyleSheet.create({
  statusStrip: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
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
