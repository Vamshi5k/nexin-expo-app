import { router } from 'expo-router';
import { LayoutGrid, LogOut, ShieldCheck } from 'lucide-react-native';
import { View } from 'react-native';

import { APP_ENV, brand } from '@/core/config';
import { useAction } from '@/core/request';
import { useClientConfig } from '@/features/client-config';
import { useTheme } from '@/theme';
import { Card, LargeTitleScroll, ListGroup, ListRow, Text, toast } from '@/ui';

import { useAuth } from '../AuthContext';
import { formatContact } from '../utils';

export function TempHomeScreen() {
  const t = useTheme();
  const config = useClientConfig();
  const auth = useAuth();
  const logout = useAction(auth.logout);
  const user = auth.user;
  const name = [user?.firstName, user?.lastName].filter(Boolean).join(' ');
  const devTools = APP_ENV !== 'production';

  return (
    <LargeTitleScroll title={config.brandName} subtitle="You're signed in">
      <View style={{ gap: t.layout.sectionGapLarge }}>
        <Card elevation="elevated" style={{ gap: t.space[1] }}>
          <Text variant="subhead" tone="secondary">
            Signed in as
          </Text>
          <Text variant="title2">{name || 'New user'}</Text>
          {user?.phone ? (
            <Text tone="secondary" tabular>
              {formatContact('phone', user.phone, brand.phoneCountryCode)}
            </Text>
          ) : null}
          {user?.email ? <Text tone="secondary">{user.email}</Text> : null}
        </Card>
        {devTools ? (
          <ListGroup title="Developer">
            <ListRow icon={LayoutGrid} title="UI kit" onPress={() => router.push('/dev/ui')} />
            <ListRow
              icon={ShieldCheck}
              iconTone="neutral"
              title="Cookie check"
              onPress={() => router.push('/dev/cookie-check')}
            />
          </ListGroup>
        ) : null}
        <ListGroup>
          <ListRow
            icon={LogOut}
            title={logout.isPending ? 'Logging out…' : 'Log out'}
            destructive
            onPress={() =>
              logout.isPending
                ? undefined
                : logout.run().catch(() => toast.error('Could not log out'))
            }
          />
        </ListGroup>
      </View>
    </LargeTitleScroll>
  );
}
