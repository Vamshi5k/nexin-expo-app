import { View } from 'react-native';

import { useTheme } from '@/theme';

import { Pressable } from './Pressable';
import { Text } from './Text';

export type Segment<T extends string> = { value: T; label: string };

export type SegmentedControlProps<T extends string> = {
  segments: Segment<T>[];
  value: T;
  onChange: (value: T) => void;
  accessibilityLabel?: string;
};

export function SegmentedControl<T extends string>({
  segments,
  value,
  onChange,
  accessibilityLabel,
}: SegmentedControlProps<T>) {
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
          <Pressable
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
            <Text variant="subhead" tone={selected ? 'primary' : 'secondary'} numberOfLines={1}>
              {s.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
