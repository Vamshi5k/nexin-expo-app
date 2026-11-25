import { View } from 'react-native';

import { AppButton, AppSheet } from '@/shared/components';

import { useTheme } from '@/shared/theme';

import { DETAILS_COPY } from '../constants/stations.constants';

type MapsChooserSheetProps = {
  open: boolean;
  onClose: () => void;
  onApple: () => void;
  onGoogle: () => void;
};

const MapsChooserSheet = ({ open, onClose, onApple, onGoogle }: MapsChooserSheetProps) => {
  const t = useTheme();

  return (
    <AppSheet open={open} onClose={onClose} title={DETAILS_COPY.mapsTitle}>
      <View style={{ gap: t.space[3] }}>
        <AppButton label={DETAILS_COPY.appleMaps} variant="secondary" onPress={onApple} />
        <AppButton label={DETAILS_COPY.googleMaps} variant="secondary" onPress={onGoogle} />
      </View>
    </AppSheet>
  );
};

export default MapsChooserSheet;
