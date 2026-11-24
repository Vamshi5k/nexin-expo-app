import { Tabs } from 'expo-router';
import { House, Wallet } from 'lucide-react-native';

import { useTheme } from '@/theme';

/** TEMPORARY tab set (Home, Wallet). The full bar (Map, Stations, Scan, Wallet, Profile) comes later. */
export default function TabsLayout() {
  const t = useTheme();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: t.colors.accentText,
        tabBarInactiveTintColor: t.colors.textTertiary,
        tabBarStyle: { backgroundColor: t.colors.surface, borderTopColor: t.colors.border },
        sceneStyle: { backgroundColor: t.colors.bg },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <House color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          title: 'Wallet',
          tabBarIcon: ({ color, size }) => <Wallet color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
