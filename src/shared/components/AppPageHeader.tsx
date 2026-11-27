import { StyleSheet, View } from 'react-native';

import type { Href } from 'expo-router';
import Animated from 'react-native-reanimated';

import AppBackButton from './AppBackButton';
import AppText from './AppText';

import { useTheme } from '@/shared/theme';

import { riseIn } from '@/shared/utils/motion';

export type AppPageHeaderProps = {
  title: string;
  subtitle?: string | null;
  eyebrow?: string | null;
  fallbackHref: Href;
  // Replaces plain back, e.g. stepping back through the wizard; Android back runs it too.
  onBack?: () => void;
};

// A pushed screen's header on the brand wash: back button, an optional eyebrow, the title and
// a caption. Used by vehicles and charging history.
const AppPageHeader = ({ title, subtitle, eyebrow, fallbackHref, onBack }: AppPageHeaderProps) => {
  const t = useTheme();

  return (
    <Animated.View entering={riseIn(0)} style={{ gap: t.space[3] }}>
      <View style={styles.row}>
        <AppBackButton fallbackHref={fallbackHref} onPress={onBack} hardwareBack={!!onBack} />
      </View>
      <View style={{ gap: t.space[1] / 2 }}>
        {eyebrow ? (
          <AppText variant="caption" tone="accent" tabular>
            {eyebrow}
          </AppText>
        ) : null}
        <AppText variant="title3" accessibilityRole="header">
          {title}
        </AppText>
        {subtitle ? (
          <AppText variant="caption" tone="secondary">
            {subtitle}
          </AppText>
        ) : null}
      </View>
    </Animated.View>
  );
};

export default AppPageHeader;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
