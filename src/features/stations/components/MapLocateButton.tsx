import { ActivityIndicator, StyleSheet } from 'react-native';

import { LocateFixed } from 'lucide-react-native';

import { AppGlass, AppPressable } from '@/shared/components';

import { mapTopBarHeight } from './MapTopBar';

import { useTheme } from '@/shared/theme';

import { MAP_COPY } from '../constants/stations.constants';

type MapLocateButtonProps = {
  locating: boolean;
  onPress: () => void;
};

const MapLocateButton = ({ locating, onPress }: MapLocateButtonProps) => {
  const t = useTheme();
  // Same height as the search capsule, so the floating controls read as one set.
  const size = mapTopBarHeight(t);

  return (
    <AppGlass radius={t.radius.pill}>
      <AppPressable
        onPress={locating ? undefined : onPress}
        haptic="light"
        accessibilityRole="button"
        accessibilityLabel={MAP_COPY.myLocation}
        accessibilityState={{ busy: locating }}
        style={[styles.button, { width: size, height: size }]}
      >
        {locating ? (
          <ActivityIndicator color={t.colors.accentText} />
        ) : (
          <LocateFixed
            color={t.colors.accentText}
            size={t.icon.control}
            strokeWidth={t.icon.stroke}
          />
        )}
      </AppPressable>
    </AppGlass>
  );
};

export default MapLocateButton;

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
