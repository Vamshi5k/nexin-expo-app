import { View } from 'react-native';

import { useAction } from '@/core/request';
import { useTheme } from '@/theme';
import { Button, PlaceholderScreen, toast } from '@/ui';

import { useAuth } from '../AuthContext';

export type SignedInPlaceholderScreenProps = { title: string; description: string };

export function SignedInPlaceholderScreen({ title, description }: SignedInPlaceholderScreenProps) {
  const t = useTheme();
  const logout = useAction(useAuth().logout);
  return (
    <PlaceholderScreen title={title} description={description}>
      <View style={{ marginTop: t.space[6] }}>
        <Button
          label="Log out"
          variant="secondary"
          loading={logout.isPending}
          onPress={() => void logout.run().catch(() => toast.error('Could not log out'))}
        />
      </View>
    </PlaceholderScreen>
  );
}
