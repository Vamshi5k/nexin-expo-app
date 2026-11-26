import type { ComponentRef, RefObject } from 'react';
import { StyleSheet, TextInput } from 'react-native';

import { Search, X } from 'lucide-react-native';

import { AppGlass, AppPressable } from '@/shared/components';

import { useTheme } from '@/shared/theme';

import { LIST_COPY } from '../constants/stations.constants';

type SearchCapsuleProps = {
  value: string;
  inputRef: RefObject<ComponentRef<typeof TextInput> | null>;
  onChange: (text: string) => void;
  onClear: () => void;
};

// The map's glass search capsule, but a real field: same height, icon and pill shape.
const SearchCapsule = ({ value, inputRef, onChange, onClear }: SearchCapsuleProps) => {
  const t = useTheme();
  // A little slimmer than the map's capsule: here it sits under a title, not over a map.
  const height = t.layout.minTouch + t.space[1];
  const clear = t.space[8];
  const inset = (height - clear) / 2;

  return (
    <AppGlass
      radius={t.radius.pill}
      style={[
        styles.capsule,
        { height, gap: t.space[2], paddingLeft: t.space[4], paddingRight: inset },
      ]}
    >
      <Search color={t.colors.textSecondary} size={t.icon.meta} strokeWidth={t.icon.stroke} />
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={onChange}
        placeholder={LIST_COPY.searchPlaceholder}
        placeholderTextColor={t.colors.textTertiary}
        selectionColor={t.colors.accent}
        accessibilityLabel={LIST_COPY.searchPlaceholder}
        returnKeyType="search"
        autoCorrect={false}
        autoCapitalize="none"
        maxFontSizeMultiplier={t.layout.maxFontScale}
        style={[
          styles.input,
          t.type.subhead,
          { lineHeight: undefined, color: t.colors.textPrimary },
        ]}
      />
      {value ? (
        <AppPressable
          onPress={onClear}
          haptic="light"
          accessibilityRole="button"
          accessibilityLabel={LIST_COPY.clearSearch}
          hitSlop={t.space[1]}
          style={[
            styles.center,
            {
              width: clear,
              height: clear,
              borderRadius: t.radius.pill,
              backgroundColor: t.colors.surfaceSunken,
            },
          ]}
        >
          <X color={t.colors.textPrimary} size={t.icon.meta} strokeWidth={t.icon.stroke} />
        </AppPressable>
      ) : null}
    </AppGlass>
  );
};

export default SearchCapsule;

const styles = StyleSheet.create({
  capsule: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: '100%',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
