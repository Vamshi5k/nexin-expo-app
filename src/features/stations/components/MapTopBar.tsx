import { StyleSheet, View } from 'react-native';

import { Search, SlidersHorizontal } from 'lucide-react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppBadge, AppGlass, AppPressable, AppText } from '@/shared/components';

import { useTheme, type Theme } from '@/shared/theme';

import { dropIn } from '@/shared/utils/motion';

import { MAP_COPY } from '../constants/stations.constants';

type MapTopBarProps = {
  activeFilterCount: number;
  onSearch: () => void;
  onFilters: () => void;
};

export const mapTopBarHeight = (t: Theme) => t.space[12] + t.space[2];

const MapTopBar = ({ activeFilterCount, onSearch, onFilters }: MapTopBarProps) => {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const height = mapTopBarHeight(t);
  // The filter button sits centred in the capsule, the same distance from top, bottom and edge.
  const inset = (height - t.layout.minTouch) / 2;

  const filtersLabel = activeFilterCount
    ? `${MAP_COPY.filters}, ${activeFilterCount} active`
    : MAP_COPY.filters;

  return (
    <Animated.View
      entering={dropIn()}
      pointerEvents="box-none"
      style={[styles.wrap, { top: insets.top + t.space[2], paddingHorizontal: t.space[4] }]}
    >
      <AppGlass radius={t.radius.pill} style={[styles.capsule, { height, paddingRight: inset }]}>
        <AppPressable
          onPress={onSearch}
          feedback="opacity"
          accessibilityRole="search"
          accessibilityLabel={MAP_COPY.searchPlaceholder}
          style={[styles.search, { gap: t.space[3], paddingLeft: t.space[5] }]}
        >
          <Search
            color={t.colors.textSecondary}
            size={t.icon.control}
            strokeWidth={t.icon.stroke}
          />
          <AppText variant="callout" tone="tertiary" numberOfLines={1}>
            {MAP_COPY.searchPlaceholder}
          </AppText>
        </AppPressable>

        <View
          style={[
            styles.divider,
            { height: t.space[6], marginHorizontal: inset, backgroundColor: t.colors.borderStrong },
          ]}
        />

        <AppPressable
          onPress={onFilters}
          haptic="light"
          accessibilityRole="button"
          accessibilityLabel={filtersLabel}
          style={[
            styles.filter,
            {
              width: t.layout.minTouch,
              height: t.layout.minTouch,
              borderRadius: t.radius.pill,
              backgroundColor: activeFilterCount ? t.colors.accentSoft : 'transparent',
            },
          ]}
        >
          <SlidersHorizontal
            color={activeFilterCount ? t.colors.accentText : t.colors.textPrimary}
            size={t.icon.control}
            strokeWidth={t.icon.stroke}
          />
          {activeFilterCount ? (
            <Animated.View
              key={activeFilterCount}
              entering={ZoomIn.springify()}
              style={[styles.badge, { top: -t.space[1], right: -t.space[1] }]}
            >
              <AppBadge label={activeFilterCount} />
            </Animated.View>
          ) : null}
        </AppPressable>
      </AppGlass>
    </Animated.View>
  );
};

export default MapTopBar;

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  capsule: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  search: {
    flex: 1,
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  divider: {
    width: StyleSheet.hairlineWidth,
  },
  filter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
  },
});
