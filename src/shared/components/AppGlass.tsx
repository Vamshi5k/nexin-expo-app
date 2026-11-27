import type { ReactNode } from 'react';
import { Platform, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { BlurView } from 'expo-blur';
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';

import { useTheme, withAlpha } from '@/shared/theme';

export type AppGlassProps = {
  children?: ReactNode;
  radius: number;
  style?: StyleProp<ViewStyle>;
  // 'light' keeps the glass light over any background (e.g. buttons floating over a photo).
  appearance?: 'auto' | 'light';
};

const LIQUID_GLASS = Platform.OS === 'ios' && isLiquidGlassAvailable();
const BLUR = Platform.OS === 'ios' && !LIQUID_GLASS;
const LIGHT_TINT = 0.55;

// Floating controls over the map and the tab bar. iOS 26 gets the native glass, older iOS a
// blur, Android a solid raised surface (blur is slow there).
const AppGlass = ({ children, radius, style, appearance = 'auto' }: AppGlassProps) => {
  const t = useTheme();
  const dark = appearance === 'light' ? false : t.scheme === 'dark';

  const frame: ViewStyle = {
    borderRadius: radius,
    borderWidth: t.layout.hairline,
    borderColor: t.colors.borderStrong,
    overflow: 'hidden',
  };

  if (LIQUID_GLASS) {
    return (
      <GlassView
        glassEffectStyle="regular"
        isInteractive
        colorScheme={appearance === 'light' ? 'light' : 'auto'}
        tintColor={appearance === 'light' ? withAlpha(t.colors.surface, LIGHT_TINT) : undefined}
        style={[{ borderRadius: radius, overflow: 'hidden' }, style]}
      >
        {children}
      </GlassView>
    );
  }

  return (
    <View
      style={[
        frame,
        {
          backgroundColor: BLUR ? withAlpha(t.colors.surfaceRaised, 0.72) : t.colors.surfaceRaised,
        },
        style,
      ]}
    >
      {BLUR ? (
        <BlurView
          tint={dark ? 'systemChromeMaterialDark' : 'systemChromeMaterialLight'}
          intensity={70}
          style={StyleSheet.absoluteFill}
        />
      ) : null}
      {children}
    </View>
  );
};

export default AppGlass;
