import { View } from 'react-native';

import { LogoutDialog, useLogoutConfirm } from '@/features/auth';
import { useTheme } from '@/shared/theme';
import { Button, PlaceholderScreen } from '@/shared/components';

export function FleetHomeScreen() {
  const t = useTheme();
  const logout = useLogoutConfirm();
  return (
    <PlaceholderScreen
      title="Fleet"
      description="Your assigned vehicle and running session will show here."
    >
      <View style={{ marginTop: t.space[6] }}>
        <Button label="Log out" variant="secondary" loading={logout.leaving} onPress={logout.ask} />
      </View>
      <LogoutDialog state={logout} />
    </PlaceholderScreen>
  );
}
