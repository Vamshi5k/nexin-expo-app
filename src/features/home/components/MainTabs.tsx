import type { ColorValue } from 'react-native';

import { Tabs } from 'expo-router';
import { EvCharger, Map, User, Wallet, type LucideIcon } from 'lucide-react-native';

import ScanTabButton from './ScanTabButton';

import { useTheme } from '@/shared/theme';

import { TAB_LABELS } from '../constants/home.constants';

type TabIconProps = { color: ColorValue; size: number; focused: boolean };

const tabIcon = (Icon: LucideIcon) => {
  const TabIcon = ({ color, size, focused }: TabIconProps) => (
    <Icon color={color} size={size} strokeWidth={focused ? 2.5 : 2} />
  );
  return TabIcon;
};

const MainTabs = () => {
  const t = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: t.colors.accentText,
        tabBarInactiveTintColor: t.colors.textTertiary,
        tabBarStyle: { backgroundColor: t.colors.surface, borderTopColor: t.colors.border },
        sceneStyle: { backgroundColor: t.colors.bg },
      }}
    >
      <Tabs.Screen name="home" options={{ title: TAB_LABELS.map, tabBarIcon: tabIcon(Map) }} />
      <Tabs.Screen
        name="stations"
        options={{ title: TAB_LABELS.stations, tabBarIcon: tabIcon(EvCharger) }}
      />
      <Tabs.Screen
        name="scanner"
        options={{ title: TAB_LABELS.scan, tabBarButton: () => <ScanTabButton /> }}
      />
      <Tabs.Screen
        name="wallet"
        options={{ title: TAB_LABELS.wallet, tabBarIcon: tabIcon(Wallet) }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: TAB_LABELS.profile, tabBarIcon: tabIcon(User) }}
      />
    </Tabs>
  );
};

export default MainTabs;
