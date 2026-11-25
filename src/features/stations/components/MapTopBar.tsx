import { StyleSheet, View } from 'react-native';

import { Search, SlidersHorizontal } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppBadge, AppGlass, AppPressable, AppText } from '@/shared/components';

import { useTheme } from '@/shared/theme';

import { MAP_COPY } from '../constants/stations.constants';

type MapTopBarProps = {
  activeFilterCount: number;
  onSearch: () => void;
  onFilters: () => void;
};

export const MAP_TOP_BAR_HEIGHT = 56;

const MapTopBar = ({ activeFilterCount, onSearch, onFilters }: MapTopBarProps) => {
  const t = useTheme();
  const insets = useSafeAreaInsets();

  const filtersLabel = activeFilterCount
    ? `${MAP_COPY.filters}, ${activeFilterCount} active`
    : MAP_COPY.filters;

  return (
    <View
      pointerEvents="box-none"
      style={[styles.wrap, { top: insets.top + t.space[2], paddingHorizontal: t.space[4] }]}
    >
      <AppGlass radius={t.radius.pill} style={styles.capsule}>
        <AppPressable
          onPress={onSearch}
          feedback="opacity"
          accessibilityRole="search"
          accessibilityLabel={MAP_COPY.searchPlaceholder}
          style={[styles.search, { gap: t.space[3], paddingLeft: t.space[5] }]}
        >
          <Search color={t.colors.textSecondary} size={20} strokeWidth={1.75} />
          <AppText variant="callout" tone="tertiary" numberOfLines={1}>
            {MAP_COPY.searchPlaceholder}
          </AppText>
        </AppPressable>

        <View style={[styles.divider, { backgroundColor: t.colors.borderStrong }]} />

        <AppPressable
          onPress={onFilters}
          haptic="light"
          accessibilityRole="button"
          accessibilityLabel={filtersLabel}
          style={[
            styles.filter,
            {
              borderRadius: t.radius.pill,
              backgroundColor: activeFilterCount ? t.colors.accentSoft : 'transparent',
            },
          ]}
        >
          <SlidersHorizontal
            color={activeFilterCount ? t.colors.accentText : t.colors.textPrimary}
            size={20}
            strokeWidth={1.75}
          />
          {activeFilterCount ? (
            <View style={styles.badge}>
              <AppBadge label={activeFilterCount} />
            </View>
          ) : null}
        </AppPressable>
      </AppGlass>
    </View>
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
    height: MAP_TOP_BAR_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 6,
  },
  search: {
    flex: 1,
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  divider: {
    width: StyleSheet.hairlineWidth,
    height: 24,
    marginHorizontal: 6,
  },
  filter: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
  },
});
