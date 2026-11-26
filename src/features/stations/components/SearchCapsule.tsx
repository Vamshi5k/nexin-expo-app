import type { ComponentRef, RefObject } from 'react';
import { StyleSheet, TextInput } from 'react-native';

import { Search, X } from 'lucide-react-native';

import { AppGlass, AppPressable } from '@/shared/components';

import { mapTopBarHeight } from './MapTopBar';

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
  const height = mapTopBarHeight(t);
  const inset = (height - t.layout.minTouch) / 2;

  return (
    <AppGlass
      radius={t.radius.pill}
      style={[
        styles.capsule,
        { height, gap: t.space[3], paddingLeft: t.space[5], paddingRight: inset },
      ]}
    >
      <Search color={t.colors.textSecondary} size={t.icon.control} strokeWidth={t.icon.stroke} />
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
        style={[styles.input, t.type.body, { lineHeight: undefined, color: t.colors.textPrimary }]}
      />
      {value ? (
        <AppPressable
          onPress={onClear}
          haptic="light"
          accessibilityRole="button"
          accessibilityLabel={LIST_COPY.clearSearch}
          style={[
            styles.center,
            {
              width: t.layout.minTouch,
              height: t.layout.minTouch,
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
