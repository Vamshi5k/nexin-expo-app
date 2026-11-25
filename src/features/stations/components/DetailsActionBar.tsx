import { StyleSheet, View } from 'react-native';

import { Navigation, Phone } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppPressable, AppText } from '@/shared/components';

import BrandGradient from './BrandGradient';

import { useTheme, type Theme } from '@/shared/theme';

import { DETAILS_COPY } from '../constants/stations.constants';

type DetailsActionBarProps = {
  eta: string | null;
  onDirections: () => void;
  onCall: (() => void) | null;
};

export const actionBarHeight = (t: Theme, bottomInset: number) =>
  t.layout.buttonHeight + t.space[3] * 2 + Math.max(bottomInset, t.space[3]);

// Pinned to the bottom so directions are always one tap away (DESIGN.md: station details).
const DetailsActionBar = ({ eta, onDirections, onCall }: DetailsActionBarProps) => {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const label = eta ? `${DETAILS_COPY.directions} · ${eta}` : DETAILS_COPY.directions;

  return (
    <View
      style={[
        styles.bar,
        {
          gap: t.space[3],
          paddingHorizontal: t.layout.screenPadding,
          paddingTop: t.space[3],
          paddingBottom: Math.max(insets.bottom, t.space[3]) + t.space[3],
          borderTopWidth: t.layout.hairline,
          borderTopColor: t.colors.border,
          backgroundColor: t.colors.surface,
        },
      ]}
    >
      <AppPressable
        onPress={onDirections}
        haptic="light"
        accessibilityRole="button"
        accessibilityLabel={label}
        style={[
          styles.grow,
          styles.center,
          styles.row,
          {
            gap: t.space[2],
            height: t.layout.buttonHeight,
            borderRadius: t.radius.pill,
            overflow: 'hidden',
          },
        ]}
      >
        <BrandGradient id="directions-button" from={t.colors.accent} to={t.colors.accentPressed} />
        <Navigation color={t.colors.onAccent} size={t.icon.control} strokeWidth={t.icon.stroke} />
        <AppText variant="headline" tone="onAccent" tabular>
          {label}
        </AppText>
      </AppPressable>
      {onCall ? (
        <AppPressable
          onPress={onCall}
          haptic="light"
          accessibilityRole="button"
          accessibilityLabel={DETAILS_COPY.call}
          style={[
            styles.center,
            {
              width: t.layout.buttonHeight,
              height: t.layout.buttonHeight,
              borderRadius: t.radius.pill,
              borderWidth: t.layout.hairline,
              borderColor: t.colors.borderStrong,
              backgroundColor: t.colors.surface,
            },
          ]}
        >
          <Phone color={t.colors.textPrimary} size={t.icon.control} strokeWidth={t.icon.stroke} />
        </AppPressable>
      ) : null}
    </View>
  );
};

export default DetailsActionBar;

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  grow: {
    flex: 1,
  },
});
