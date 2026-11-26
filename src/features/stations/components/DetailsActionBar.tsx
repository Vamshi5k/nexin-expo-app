import { StyleSheet } from 'react-native';

import { Navigation, Phone } from 'lucide-react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppGlass, AppPressable, AppText } from '@/shared/components';

import { useTheme, type Theme } from '@/shared/theme';

import { springUp } from '@/shared/utils/motion';

import { DETAILS_COPY } from '../constants/stations.constants';

type DetailsActionBarProps = {
  eta: string | null;
  onDirections: () => void;
  onCall: (() => void) | null;
};

export const actionBarHeight = (t: Theme, bottomInset: number) =>
  t.layout.buttonHeight + t.space[1] * 2 + Math.max(bottomInset, t.space[3]);

// Floats like the map's tab bar: a glass capsule holding the map card's dark Go pill.
const DetailsActionBar = ({ eta, onDirections, onCall }: DetailsActionBarProps) => {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const label = eta ? `${DETAILS_COPY.directions} · ${eta}` : DETAILS_COPY.directions;

  return (
    <Animated.View
      entering={springUp(4)}
      pointerEvents="box-none"
      style={[
        styles.wrap,
        { paddingHorizontal: t.space[4], paddingBottom: Math.max(insets.bottom, t.space[3]) },
      ]}
    >
      <AppGlass
        radius={t.radius.pill}
        style={[styles.row, { gap: t.space[1], padding: t.space[1] }]}
      >
        <AppPressable
          onPress={onDirections}
          haptic="light"
          accessibilityRole="button"
          accessibilityLabel={label}
          style={[
            styles.row,
            styles.grow,
            styles.center,
            {
              gap: t.space[2],
              height: t.layout.buttonHeight,
              borderRadius: t.radius.pill,
              backgroundColor: t.colors.textPrimary,
            },
          ]}
        >
          <Navigation color={t.colors.surface} size={t.icon.control} strokeWidth={t.icon.stroke} />
          <AppText
            variant="subhead"
            tabular
            style={{ fontFamily: t.type.headline.fontFamily, color: t.colors.surface }}
          >
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
                backgroundColor: t.colors.surfaceSunken,
              },
            ]}
          >
            <Phone color={t.colors.textPrimary} size={t.icon.control} strokeWidth={t.icon.stroke} />
          </AppPressable>
        ) : null}
      </AppGlass>
    </Animated.View>
  );
};

export default DetailsActionBar;

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  grow: {
    flex: 1,
  },
});
