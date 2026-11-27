import type { ComponentRef, Ref } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { Search, X } from 'lucide-react-native';

import AppPressable from './AppPressable';

import { useTheme } from '@/shared/theme';

export type AppSearchBarProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  // Shown with the clear button; defaults to clearing the text.
  onClear?: () => void;
  clearLabel?: string;
  autoFocus?: boolean;
  ref?: Ref<ComponentRef<typeof TextInput>>;
};

// The app's search field: a solid white pill with a hairline edge, a search icon, and a clear
// button once there is text. Used by the Stations tab and the vehicle pickers.
const AppSearchBar = ({
  value,
  onChangeText,
  placeholder,
  onClear,
  clearLabel = 'Clear search',
  autoFocus,
  ref,
}: AppSearchBarProps) => {
  const t = useTheme();
  const height = t.layout.minTouch;
  const clear = t.space[8] - t.space[1];
  const inset = (height - clear) / 2;

  return (
    <View
      style={[
        styles.capsule,
        {
          height,
          gap: t.space[2],
          paddingLeft: t.space[4],
          paddingRight: inset,
          borderRadius: t.radius.pill,
          borderWidth: t.layout.hairline,
          borderColor: t.colors.border,
          backgroundColor: t.colors.surfaceRaised,
        },
      ]}
    >
      <Search color={t.colors.textSecondary} size={t.icon.meta} strokeWidth={t.icon.stroke} />
      <TextInput
        ref={ref}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={t.colors.textTertiary}
        selectionColor={t.colors.accent}
        accessibilityLabel={placeholder}
        returnKeyType="search"
        autoCorrect={false}
        autoCapitalize="none"
        autoFocus={autoFocus}
        maxFontSizeMultiplier={t.layout.maxFontScale}
        style={[
          styles.input,
          t.type.subhead,
          { lineHeight: undefined, color: t.colors.textPrimary },
        ]}
      />
      {value ? (
        <AppPressable
          onPress={onClear ?? (() => onChangeText(''))}
          haptic="light"
          accessibilityRole="button"
          accessibilityLabel={clearLabel}
          hitSlop={t.space[2]}
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
    </View>
  );
};

export default AppSearchBar;

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
