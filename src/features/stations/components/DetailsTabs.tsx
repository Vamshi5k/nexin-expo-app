import { StyleSheet, View } from 'react-native';

import { AppPressable, AppText } from '@/shared/components';

import BrandGradient from './BrandGradient';

import { useTheme } from '@/shared/theme';

import type { DetailsTab } from '../types/stations.types';

type DetailsTabsProps = {
  value: DetailsTab;
  tabs: { value: DetailsTab; label: string }[];
  onChange: (tab: DetailsTab) => void;
};

// Two pills on a sunken track; the active one carries the brand gradient.
const DetailsTabs = ({ value, tabs, onChange }: DetailsTabsProps) => {
  const t = useTheme();

  return (
    <View
      accessibilityRole="tablist"
      style={[
        styles.track,
        {
          padding: t.space[1],
          borderRadius: t.radius.pill,
          backgroundColor: t.colors.surfaceSunken,
        },
      ]}
    >
      {tabs.map(tab => {
        const active = tab.value === value;

        return (
          <AppPressable
            key={tab.value}
            onPress={() => onChange(tab.value)}
            haptic={active ? false : 'selection'}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={tab.label}
            style={[
              styles.tab,
              { height: t.layout.minTouch, borderRadius: t.radius.pill, overflow: 'hidden' },
            ]}
          >
            {active ? (
              <BrandGradient
                id={`tab-${tab.value}`}
                from={t.colors.accent}
                to={t.colors.accentPressed}
              />
            ) : null}
            <AppText
              variant="subhead"
              style={{
                fontFamily: t.type.headline.fontFamily,
                color: active ? t.colors.onAccent : t.colors.textSecondary,
              }}
            >
              {tab.label}
            </AppText>
          </AppPressable>
        );
      })}
    </View>
  );
};

export default DetailsTabs;

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
