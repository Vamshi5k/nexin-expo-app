import { StyleSheet, View } from 'react-native';

import { Pencil, Star, Trash2, type LucideIcon } from 'lucide-react-native';

import { AppPressable, AppSheet, AppText } from '@/shared/components';

import { useTheme } from '@/shared/theme';

import { VEHICLES_COPY } from '../constants/vehicles.constants';

type VehicleActionsSheetProps = {
  open: boolean;
  title: string;
  isPrimary: boolean;
  onClose: () => void;
  onEdit: () => void;
  onMakePrimary: () => void;
  onDelete: () => void;
};

type ActionProps = {
  icon: LucideIcon;
  label: string;
  danger?: boolean;
  onPress: () => void;
};

const Action = ({ icon: Icon, label, danger, onPress }: ActionProps) => {
  const t = useTheme();
  const ink = danger ? t.colors.dangerText : t.colors.textPrimary;

  return (
    <AppPressable
      onPress={onPress}
      feedback="opacity"
      haptic="selection"
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[styles.row, { gap: t.space[3], minHeight: t.layout.minTouch + t.space[1] }]}
    >
      <View
        style={[
          styles.center,
          {
            width: t.space[8] + t.space[1],
            height: t.space[8] + t.space[1],
            borderRadius: t.radius.control,
            backgroundColor: danger ? t.colors.dangerSoft : t.colors.surfaceSunken,
          },
        ]}
      >
        <Icon color={ink} size={t.icon.meta} strokeWidth={t.icon.stroke} />
      </View>
      <AppText variant="subhead" style={{ fontFamily: t.type.headline.fontFamily, color: ink }}>
        {label}
      </AppText>
    </AppPressable>
  );
};

// Edit, Make primary (unless it already is) and Delete for one vehicle.
const VehicleActionsSheet = ({
  open,
  title,
  isPrimary,
  onClose,
  onEdit,
  onMakePrimary,
  onDelete,
}: VehicleActionsSheetProps) => {
  const t = useTheme();

  return (
    <AppSheet open={open} onClose={onClose} title={title}>
      <View style={{ gap: t.space[1] }}>
        <Action icon={Pencil} label={VEHICLES_COPY.edit} onPress={onEdit} />
        {isPrimary ? null : (
          <Action icon={Star} label={VEHICLES_COPY.makePrimary} onPress={onMakePrimary} />
        )}
        <Action icon={Trash2} label={VEHICLES_COPY.delete} danger onPress={onDelete} />
      </View>
    </AppSheet>
  );
};

export default VehicleActionsSheet;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
