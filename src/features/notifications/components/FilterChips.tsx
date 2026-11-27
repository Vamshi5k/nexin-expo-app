import { ScrollView } from 'react-native';

import { AppPressable, AppText } from '@/shared/components';

import { useTheme, withAlpha } from '@/shared/theme';

import { KIND_LABEL, NOTIFICATIONS_COPY } from '../constants/notifications.constants';
import type { NotificationFilter } from '../types/notifications.types';

type FilterChipsProps = {
  filters: { value: NotificationFilter; count: number }[];
  value: NotificationFilter;
  onChange: (value: NotificationFilter) => void;
};

// Six categories don't fit a segmented control, so they scroll sideways as pills, edge to edge:
// the picked one dark like the tabs' thumb, the rest white, each with its count.
const FilterChips = ({ filters, value, onChange }: FilterChipsProps) => {
  const t = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      accessibilityRole="tablist"
      accessibilityLabel={NOTIFICATIONS_COPY.filtersLabel}
      style={{ marginHorizontal: -t.layout.screenPadding }}
      contentContainerStyle={{ gap: t.space[2], paddingHorizontal: t.layout.screenPadding }}
    >
      {filters.map(filter => {
        const selected = filter.value === value;
        const label = filter.value === 'all' ? NOTIFICATIONS_COPY.all : KIND_LABEL[filter.value];
        return (
          <AppPressable
            key={filter.value}
            onPress={() => !selected && onChange(filter.value)}
            haptic={selected ? false : 'selection'}
            feedback="opacity"
            accessibilityRole="tab"
            accessibilityLabel={label}
            accessibilityState={{ selected }}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: t.space[1] + t.space[1] / 2,
              height: t.space[8] + t.space[1],
              paddingHorizontal: t.space[3] + t.space[1],
              borderRadius: t.radius.pill,
              borderWidth: t.layout.hairline,
              borderColor: selected ? t.colors.textPrimary : t.colors.border,
              backgroundColor: selected ? t.colors.textPrimary : t.colors.surfaceRaised,
            }}
          >
            <AppText
              variant="caption"
              style={{
                fontFamily: t.type.headline.fontFamily,
                color: selected ? t.colors.surface : t.colors.textPrimary,
              }}
            >
              {label}
            </AppText>
            {filter.count ? (
              <AppText
                variant="caption"
                tabular
                style={{
                  color: selected ? withAlpha(t.colors.surface, 0.65) : t.colors.textTertiary,
                }}
              >
                {filter.count}
              </AppText>
            ) : null}
          </AppPressable>
        );
      })}
    </ScrollView>
  );
};

export default FilterChips;
