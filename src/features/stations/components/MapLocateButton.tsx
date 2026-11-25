import { ActivityIndicator, StyleSheet } from 'react-native';

import { Navigation } from 'lucide-react-native';

import { AppPressable } from '@/shared/components';

import { useTheme } from '@/shared/theme';

import { MAP_COPY } from '../constants/stations.constants';

type MapLocateButtonProps = {
  locating: boolean;
  onPress: () => void;
};

const MapLocateButton = ({ locating, onPress }: MapLocateButtonProps) => {
  const t = useTheme();

  return (
    <AppPressable
      onPress={locating ? undefined : onPress}
      accessibilityRole="button"
      accessibilityLabel={MAP_COPY.myLocation}
      accessibilityState={{ busy: locating }}
      style={[
        styles.button,
        { backgroundColor: t.colors.accent, shadowColor: t.colors.textPrimary },
      ]}
    >
      {locating ? (
        <ActivityIndicator color={t.colors.onAccent} />
      ) : (
        <Navigation color={t.colors.onAccent} size={20} />
      )}
    </AppPressable>
  );
};

export default MapLocateButton;

const styles = StyleSheet.create({
  button: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
});
