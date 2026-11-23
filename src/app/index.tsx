import { router } from 'expo-router';
import { LayoutGrid, Moon } from 'lucide-react-native';
import { View } from 'react-native';

import { APP_ENV, brand } from '@/core/config';
import { isDevToolsEnabled } from '@/dev/devTools';
import { useTheme } from '@/theme';
import { BrandLogo, Card, LargeTitleScroll, ListGroup, ListRow, StatusChip, Text } from '@/ui';

/** Placeholder home until Phase 2 adds the splash gate and auth routing. */
export default function Index() {
  const t = useTheme();
  const devTools = isDevToolsEnabled(APP_ENV);
  return (
    <LargeTitleScroll title={brand.appName} subtitle="Foundation build">
      <View style={{ gap: t.layout.sectionGapLarge }}>
        <Card elevation="elevated" style={{ gap: t.space[4], paddingVertical: t.space[6] }}>
          <BrandLogo height={40} />
          <View style={{ gap: t.space[1] }}>
            <Text variant="headline">The app shell is ready</Text>
            <Text tone="secondary">
              Theme, UI kit, session and networking are in place. Screens arrive in the next
              phases.
            </Text>
          </View>
          <StatusChip label={`Environment: ${APP_ENV}`} tone="accent" />
        </Card>
        {devTools ? (
          <ListGroup title="Developer" footer="Hidden in production builds.">
            <ListRow
              icon={LayoutGrid}
              title="UI kit"
              subtitle="Every component in the design system"
              onPress={() => router.push('/dev/ui')}
            />
            <ListRow
              icon={Moon}
              iconTone="neutral"
              title="UI kit in dark mode"
              onPress={() => router.push({ pathname: '/dev/ui', params: { scheme: 'dark' } })}
            />
          </ListGroup>
        ) : null}
      </View>
    </LargeTitleScroll>
  );
}
