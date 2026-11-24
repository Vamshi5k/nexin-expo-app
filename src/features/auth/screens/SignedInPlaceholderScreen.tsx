import { View } from 'react-native';

import { useTheme } from '@/theme';
import { Button, PlaceholderScreen } from '@/ui';

import { LogoutDialog } from '../components/LogoutDialog';
import { useLogoutConfirm } from '../hooks';

export type SignedInPlaceholderScreenProps = { title: string; description: string };

export function SignedInPlaceholderScreen({ title, description }: SignedInPlaceholderScreenProps) {
  const t = useTheme();
  const logout = useLogoutConfirm();
  return (
    <PlaceholderScreen title={title} description={description}>
      <View style={{ marginTop: t.space[6] }}>
        <Button label="Log out" variant="secondary" loading={logout.leaving} onPress={logout.ask} />
      </View>
      <LogoutDialog state={logout} />
    </PlaceholderScreen>
  );
}
