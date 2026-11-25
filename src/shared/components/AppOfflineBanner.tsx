import { useState } from 'react';
import { View } from 'react-native';

import { RefreshCw, WifiOff } from 'lucide-react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AppButton from './AppButton';
import AppText from './AppText';

import { useTheme } from '@/shared/theme';

import { OFFLINE_COPY, recheckOnline, useOnline } from '@/core/network';

const AppOfflineBanner = () => {
  const online = useOnline();

  return online === false ? <OfflineCard /> : null;
};

const OfflineCard = () => {
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
          <AppText variant="headline">{OFFLINE_COPY.title}</AppText>
          <AppText variant="callout" tone="secondary">
            {OFFLINE_COPY.body}
          </AppText>
          {stillOffline ? (
            <AppText variant="caption" tone="danger">
              {OFFLINE_COPY.stillOffline}
            </AppText>
          ) : null}
        </View>
      </View>
      <AppButton
        label={OFFLINE_COPY.retry}
        icon={RefreshCw}
        variant="secondary"
        size="medium"
        onPress={retry}
        loading={checking}
      />
    </Animated.View>
  );
};

export default AppOfflineBanner;
