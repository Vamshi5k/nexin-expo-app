import { Bell, MapPin } from 'lucide-react-native';
import { View } from 'react-native';

import { AuthScaffold } from '@/features/auth';
import { useTheme } from '@/theme';
import { Button, Reveal, Text } from '@/ui';

import { PermissionCard } from '../components/PermissionCard';
import { SetupHeader } from '../components/SetupHeader';
import { PERMISSIONS_COPY } from '../constants';
import { usePermissionsSetup } from '../hooks';

export function PermissionsScreen() {
  const t = useTheme();
  const perms = usePermissionsSetup();
  return (
    <AuthScaffold
      topBar={<SetupHeader step={3} />}
      hero={
        <Reveal index={0} style={{ gap: t.space[2] }}>
          <Text variant="hero" accessibilityRole="header">
            {PERMISSIONS_COPY.title}
          </Text>
          <Text variant="callout" tone="secondary">
            {PERMISSIONS_COPY.subtitle}
          </Text>
        </Reveal>
      }
      footer={<Button label="Continue" onPress={perms.finish} />}
    >
      <Reveal index={1} style={{ gap: t.space[3] }}>
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
        <View style={{ gap: t.space[1], paddingHorizontal: t.space[1] }}>
          <Text variant="caption" tone="secondary">
            {PERMISSIONS_COPY.locationNote}
          </Text>
          <Text variant="caption" tone="secondary">
            {PERMISSIONS_COPY.settingsNote}
          </Text>
        </View>
      </Reveal>
    </AuthScaffold>
  );
}
