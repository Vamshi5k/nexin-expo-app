import { View } from 'react-native';

import { useTheme } from '@/theme';
import { Button, PlaceholderScreen, toast } from '@/ui';

import { useLogout } from '../hooks';

export type SignedInPlaceholderScreenProps = { title: string; description: string };

export function SignedInPlaceholderScreen({ title, description }: SignedInPlaceholderScreenProps) {
  const t = useTheme();
  const logout = useLogout();
  return (
    <PlaceholderScreen title={title} description={description}>
      <View style={{ marginTop: t.space[6] }}>
        <Button
          label="Log out"
          variant="secondary"
          loading={logout.isPending}
          onPress={() =>
            logout.mutate(undefined, { onError: () => toast.error('Could not log out') })
          }
        />
      </View>
    </PlaceholderScreen>
  );
}
