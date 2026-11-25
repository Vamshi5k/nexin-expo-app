import { View } from 'react-native';

import { LogoutDialog, useLogoutConfirm } from '@/features/auth';
import { useTheme } from '@/shared/theme';
import { AppButton, AppPlaceholderScreen } from '@/shared/components';

export function FleetHomeScreen() {
  const t = useTheme();
  const logout = useLogoutConfirm();
  return (
    <AppPlaceholderScreen
      title="Fleet"
      description="Your assigned vehicle and running session will show here."
    >
      <View style={{ marginTop: t.space[6] }}>
        <AppButton
          label="Log out"
          variant="secondary"
          loading={logout.leaving}
          onPress={logout.ask}
        />
      </View>
      <LogoutDialog state={logout} />
    </AppPlaceholderScreen>
  );
}
