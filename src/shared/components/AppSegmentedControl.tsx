import { View } from 'react-native';

import AppPressable from './AppPressable';
import AppText from './AppText';

import { useTheme } from '@/shared/theme';

export type Segment<T extends string> = { value: T; label: string };

export type AppSegmentedControlProps<T extends string> = {
  segments: Segment<T>[];
  value: T;
  onChange: (value: T) => void;
  accessibilityLabel?: string;
};

const AppSegmentedControl = <T extends string>({
  segments,
  value,
  onChange,
  accessibilityLabel,
}: AppSegmentedControlProps<T>) => {
  const t = useTheme();
  return (
    <View
      accessibilityRole="tablist"
      accessibilityLabel={accessibilityLabel}
      style={{
        flexDirection: 'row',
        backgroundColor: t.colors.surfaceSunken,
        borderRadius: t.radius.control,
        padding: 3,
        gap: 3,
      }}
    >
      {segments.map(s => {
        const selected = s.value === value;
        return (
          <AppPressable
            key={s.value}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={s.label}
            onPress={() => !selected && onChange(s.value)}
            haptic={selected ? false : 'selection'}
            feedback="opacity"
            style={[
              {
                flex: 1,
                minHeight: 38,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: t.radius.control - 3,
                backgroundColor: selected ? t.colors.surfaceRaised : 'transparent',
                borderWidth: selected ? t.layout.hairline : 0,
                borderColor: t.colors.border,
              },
            ]}
          >
            <AppText variant="subhead" tone={selected ? 'primary' : 'secondary'} numberOfLines={1}>
              {s.label}
            </AppText>
          </AppPressable>
        );
      })}
    </View>
  );
};

export default AppSegmentedControl;
