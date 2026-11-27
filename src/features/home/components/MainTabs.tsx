import { Tabs } from 'expo-router';

import FloatingTabBar from './FloatingTabBar';

import { useTheme } from '@/shared/theme';

import { SCAN_ROUTE, TAB_LABELS } from '../constants/home.constants';

const MainTabs = () => {
  const t = useTheme();

  return (
    <Tabs
      tabBar={props => <FloatingTabBar {...props} />}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: t.colors.bg } }}
    >
      <Tabs.Screen name="home" options={{ title: TAB_LABELS.map }} />
      <Tabs.Screen name="stations" options={{ title: TAB_LABELS.stations }} />
      <Tabs.Screen name={SCAN_ROUTE} options={{ title: TAB_LABELS.scan }} />
      <Tabs.Screen name="wallet" options={{ title: TAB_LABELS.wallet }} />
      <Tabs.Screen name="profile" options={{ title: TAB_LABELS.profile }} />
    </Tabs>
  );
};

export default MainTabs;
