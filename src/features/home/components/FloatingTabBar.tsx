import { useContext } from 'react';
import { StyleSheet, View } from 'react-native';

import { router } from 'expo-router';
import { BottomTabBarHeightCallbackContext, type BottomTabBarProps } from 'expo-router/tabs';
import { EvCharger, Map, ScanLine, User, Wallet, type LucideIcon } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppGlass, AppPressable, AppText } from '@/shared/components';

import { useTheme } from '@/shared/theme';

import { SCAN_HREF, SCAN_ROUTE, TAB_LABELS } from '../constants/home.constants';

const ICONS: Record<string, LucideIcon> = {
  home: Map,
  stations: EvCharger,
  wallet: Wallet,
  profile: User,
};

const FloatingTabBar = ({ state, descriptors, emitter, navigateToTab }: BottomTabBarProps) => {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const reportHeight = useContext(BottomTabBarHeightCallbackContext);
  // Tab: nav icon + caption label + breathing room; the scan circle uses the large button height.
  const barHeight = t.space[12] + t.space[5];

  return (
    <View
      pointerEvents="box-none"
      onLayout={event => reportHeight?.(event.nativeEvent.layout.height)}
      style={[
        styles.wrap,
        { paddingHorizontal: t.space[4], paddingBottom: Math.max(insets.bottom, t.space[3]) },
      ]}
    >
      <AppGlass
        radius={t.radius.pill}
        style={[styles.bar, { height: barHeight, padding: t.space[1] }]}
      >
        {state.routes.map((route, index) => {
          if (route.name === SCAN_ROUTE) {
            return (
              <View key={route.key} style={styles.item}>
                <AppPressable
                  onPress={() => router.push(SCAN_HREF)}
                  haptic="light"
                  accessibilityRole="button"
                  accessibilityLabel={TAB_LABELS.scan}
                  style={[
                    styles.scan,
                    {
                      width: t.layout.buttonHeight,
                      height: t.layout.buttonHeight,
                      borderRadius: t.radius.pill,
                      backgroundColor: t.colors.accent,
                    },
                  ]}
                >
                  <ScanLine
                    color={t.colors.onAccent}
                    size={t.icon.nav}
                    strokeWidth={t.icon.stroke}
                  />
                </AppPressable>
              </View>
            );
          }

          const focused = state.index === index;
          const label = descriptors[route.key]?.options.title ?? route.name;
          const Icon = ICONS[route.name] ?? Map;
          const color = focused ? t.colors.accentText : t.colors.textSecondary;

          const onPress = () => {
            const event = emitter.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented) navigateToTab(route.key);
          };

          return (
            <AppPressable
              key={route.key}
              onPress={onPress}
              haptic={focused ? false : 'light'}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={label}
              style={[
                styles.item,
                {
                  borderRadius: t.radius.pill,
                  backgroundColor: focused ? t.colors.accentSoft : 'transparent',
                },
              ]}
            >
              <Icon color={color} size={t.icon.nav} strokeWidth={t.icon.stroke} />
              <AppText
                variant="caption"
                numberOfLines={1}
                style={{ color }}
                maxFontSizeMultiplier={1.1}
              >
                {label}
              </AppText>
            </AppPressable>
          );
        })}
      </AppGlass>
    </View>
  );
};

export default FloatingTabBar;

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  item: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scan: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
