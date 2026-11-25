import { StyleSheet, View } from 'react-native';

import { Search, SlidersHorizontal } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppBadge, AppPressable, AppText } from '@/shared/components';

import { useTheme } from '@/shared/theme';

import { MAP_COPY } from '../constants/stations.constants';

type MapTopBarProps = {
  activeFilterCount: number;
  onSearch: () => void;
  onFilters: () => void;
};

const MapTopBar = ({ activeFilterCount, onSearch, onFilters }: MapTopBarProps) => {
  const t = useTheme();
  const insets = useSafeAreaInsets();

  const floating = {
    backgroundColor: t.colors.surface,
    borderColor: t.colors.border,
    shadowColor: t.colors.textPrimary,
  };

  const filtersLabel = activeFilterCount
    ? `${MAP_COPY.filters}, ${activeFilterCount} active`
    : MAP_COPY.filters;

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.bar,
        {
          top: insets.top + t.space[2],
          paddingHorizontal: t.layout.screenPadding,
          gap: t.space[2],
        },
      ]}
    >
      <AppPressable
        onPress={onSearch}
        accessibilityRole="search"
        accessibilityLabel={MAP_COPY.searchPlaceholder}
        style={[
          styles.search,
          floating,
          { borderRadius: t.radius.control, gap: t.space[2], paddingHorizontal: t.space[4] },
        ]}
      >
        <Search color={t.colors.accentText} size={20} />
        <AppText tone="tertiary">{MAP_COPY.searchPlaceholder}</AppText>
      </AppPressable>

      <AppPressable
        onPress={onFilters}
        accessibilityRole="button"
        accessibilityLabel={filtersLabel}
        style={[styles.filter, floating, { borderRadius: t.radius.control }]}
      >
        <SlidersHorizontal color={t.colors.textPrimary} size={20} />
        {activeFilterCount ? (
          <View style={styles.badge}>
            <AppBadge label={activeFilterCount} />
          </View>
        ) : null}
      </AppPressable>
    </View>
  );
};

export default MapTopBar;

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
  },
  search: {
    flex: 1,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  filter: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
  },
});
