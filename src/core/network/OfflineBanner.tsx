import { RefreshCw, WifiOff } from 'lucide-react-native';
import { useState } from 'react';
import { View } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/theme';
import { Button, Text } from '@/ui';

import { recheckOnline, useOnline } from './useOnline';

/** Copy from docs/screen-audit.md 2.9. */
export const OFFLINE_COPY = {
  title: 'No Connection',
  body: "You're offline. Check your Wi-Fi or mobile data and try again.",
  stillOffline: 'Still offline — check your settings',
  retry: 'Try Again',
} as const;

/**
 * Non-blocking banner over the top of the app (the old full-screen overlay unmounted the
 * navigator and lost in-progress flows). Hides itself when the connection returns.
 */
export function OfflineBanner() {
  const online = useOnline();
  // Mounted only while offline, so the card's retry state resets on every new outage.
  return online === false ? <OfflineCard /> : null;
}

function OfflineCard() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const [checking, setChecking] = useState(false);
  const [stillOffline, setStillOffline] = useState(false);

  const retry = async () => {
    setChecking(true);
    const ok = await recheckOnline();
    setChecking(false);
    setStillOffline(!ok);
  };

  return (
    <Animated.View
      entering={FadeInUp}
      exiting={FadeOutUp}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      style={{
        position: 'absolute',
        top: insets.top + t.space[2],
        left: t.space[4],
        right: t.space[4],
        zIndex: 1000,
        backgroundColor: t.colors.surfaceRaised,
        borderRadius: t.radius.card,
        borderWidth: t.layout.hairline,
        borderColor: t.colors.border,
        padding: t.space[4],
        gap: t.space[3],
        ...t.shadow,
      }}
    >
      <View style={{ flexDirection: 'row', gap: t.space[3], alignItems: 'flex-start' }}>
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: t.radius.pill,
            backgroundColor: t.colors.dangerSoft,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <WifiOff color={t.colors.dangerText} size={20} strokeWidth={1.75} />
        </View>
        <View style={{ flex: 1, gap: t.space[1] }}>
          <Text variant="headline">{OFFLINE_COPY.title}</Text>
          <Text variant="callout" tone="secondary">
            {OFFLINE_COPY.body}
          </Text>
          {stillOffline ? (
            <Text variant="caption" tone="danger">
              {OFFLINE_COPY.stillOffline}
            </Text>
          ) : null}
        </View>
      </View>
      <Button
        label={OFFLINE_COPY.retry}
        icon={RefreshCw}
        variant="secondary"
        size="small"
        onPress={retry}
        loading={checking}
      />
    </Animated.View>
  );
}
