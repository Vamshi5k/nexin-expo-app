import { ActivityIndicator, StyleSheet } from 'react-native';

import { LocateFixed } from 'lucide-react-native';

import { AppGlass, AppPressable } from '@/shared/components';

import { useTheme } from '@/shared/theme';

import { MAP_COPY } from '../constants/stations.constants';

type MapLocateButtonProps = {
  locating: boolean;
  onPress: () => void;
};

const SIZE = 52;

const MapLocateButton = ({ locating, onPress }: MapLocateButtonProps) => {
  const t = useTheme();

  return (
    <AppGlass radius={SIZE / 2}>
      <AppPressable
        onPress={locating ? undefined : onPress}
        haptic="light"
        accessibilityRole="button"
        accessibilityLabel={MAP_COPY.myLocation}
        accessibilityState={{ busy: locating }}
        style={styles.button}
      >
        {locating ? (
          <ActivityIndicator color={t.colors.accentText} />
        ) : (
          <LocateFixed color={t.colors.accentText} size={22} strokeWidth={1.75} />
        )}
      </AppPressable>
    </AppGlass>
  );
};

export default MapLocateButton;

const styles = StyleSheet.create({
  button: {
    width: SIZE,
    height: SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
