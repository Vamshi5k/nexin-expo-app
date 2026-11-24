import { Bell, MapPin } from 'lucide-react-native';
import { View } from 'react-native';

import { useTheme } from '@/theme';
import { Button, Text } from '@/ui';

import { PermissionCard } from '../components/PermissionCard';
import { SetupLayout } from '../components/SetupLayout';
import { PERMISSIONS_COPY } from '../constants';
import { usePermissionsSetup } from '../hooks';

export function PermissionsScreen() {
  const t = useTheme();
  const perms = usePermissionsSetup();
  return (
    <SetupLayout
      step={3}
      title={PERMISSIONS_COPY.title}
      subtitle={PERMISSIONS_COPY.subtitle}
      footer={<Button label="Continue" onPress={perms.finish} />}
    >
      <View style={{ gap: t.space[3] }}>
        <PermissionCard
          icon={MapPin}
          title={PERMISSIONS_COPY.location.title}
          description={PERMISSIONS_COPY.location.description}
          status={perms.status.location}
          pending={perms.pending === 'location'}
          onAllow={() => perms.allow('location')}
        />
        <PermissionCard
          icon={Bell}
          title={PERMISSIONS_COPY.notifications.title}
          description={PERMISSIONS_COPY.notifications.description}
          status={perms.status.notifications}
          pending={perms.pending === 'notifications'}
          onAllow={() => perms.allow('notifications')}
        />
        <View style={{ gap: t.space[1], paddingHorizontal: t.space[1], marginTop: t.space[2] }}>
          <Text variant="caption" tone="secondary">
            {PERMISSIONS_COPY.locationNote}
          </Text>
          <Text variant="caption" tone="secondary">
            {PERMISSIONS_COPY.settingsNote}
          </Text>
        </View>
      </View>
    </SetupLayout>
  );
}
