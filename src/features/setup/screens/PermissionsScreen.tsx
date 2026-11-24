import { Bell, MapPin } from 'lucide-react-native';
import { View } from 'react-native';

import type { PermissionResult } from '@/core/permissions';
import { useTheme } from '@/theme';
import { Button, ListGroup, ListRow, Reveal, Screen, StatusChip, Text } from '@/ui';

import { SetupHeader } from '../components/SetupHeader';
import { PERMISSIONS_COPY } from '../constants';
import { usePermissionsSetup } from '../hooks';
import type { SetupPermission } from '../profile';

export function PermissionsScreen() {
  const t = useTheme();
  const perms = usePermissionsSetup();

  const action = (kind: SetupPermission, status: PermissionResult | null) =>
    status === 'granted' ? (
      <StatusChip label="Allowed" tone="success" />
    ) : (
      <Button
        label={status === 'blocked' ? 'Open Settings' : 'Allow'}
        variant={status === 'blocked' ? 'secondary' : 'primary'}
        size="medium"
        loading={perms.pending === kind}
        disabled={status === null}
        onPress={() => perms.allow(kind)}
      />
    );

  return (
    <Screen
      scroll
      footer={<Button label="Continue" onPress={perms.finish} />}
      contentStyle={{ gap: t.space[8] }}
    >
      <SetupHeader step={3} />
      <Reveal index={0} style={{ gap: t.space[2] }}>
        <Text variant="hero" accessibilityRole="header">
          {PERMISSIONS_COPY.title}
        </Text>
        <Text variant="callout" tone="secondary">
          {PERMISSIONS_COPY.subtitle}
        </Text>
      </Reveal>
      <Reveal index={1} style={{ gap: t.space[4] }}>
        <ListGroup>
          <ListRow
            icon={MapPin}
            title={PERMISSIONS_COPY.location.title}
            subtitle={PERMISSIONS_COPY.location.description}
            trailing={action('location', perms.status.location)}
          />
          <ListRow
            icon={Bell}
            title={PERMISSIONS_COPY.notifications.title}
            subtitle={PERMISSIONS_COPY.notifications.description}
            trailing={action('notifications', perms.status.notifications)}
          />
        </ListGroup>
        <View style={{ gap: t.space[1], paddingHorizontal: t.space[1] }}>
          <Text variant="caption" tone="secondary">
            {PERMISSIONS_COPY.locationNote}
          </Text>
          <Text variant="caption" tone="secondary">
            {PERMISSIONS_COPY.settingsNote}
          </Text>
        </View>
      </Reveal>
    </Screen>
  );
}
