import type { LucideIcon } from 'lucide-react-native';
import { Modal, StyleSheet, View } from 'react-native';

import { useTheme } from '@/shared/theme';

import { Button } from './Button';
import { haptics } from '@/shared/utils/haptics';
import { Text } from './Text';

export type DialogProps = {
  open: boolean;
  title: string;
  message?: string;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  destructive?: boolean;
  loading?: boolean;
  icon?: LucideIcon;
};

export function Dialog({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  destructive,
  loading,
  icon: Icon,
}: DialogProps) {
  const t = useTheme();
  return (
    <Modal
      visible={open}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onCancel}
      onShow={() => {
        if (destructive) haptics.warning();
      }}
    >
      <View
        style={[
          styles.backdrop,
          { backgroundColor: t.colors.overlay, padding: t.layout.screenPadding },
        ]}
      >
        <View
          accessibilityViewIsModal
          accessibilityRole="alert"
          style={[
            styles.card,
            {
              backgroundColor: t.colors.surfaceRaised,
              borderRadius: t.radius.card,
              borderWidth: t.layout.hairline,
              borderColor: t.colors.border,
              padding: t.space[6],
              gap: t.space[2],
            },
          ]}
        >
          {Icon ? (
            <View
              style={[
                styles.icon,
                {
                  borderRadius: t.radius.pill,
                  backgroundColor: destructive ? t.colors.dangerSoft : t.colors.accentSoft,
                  marginBottom: t.space[2],
                },
              ]}
            >
              <Icon
                color={destructive ? t.colors.dangerText : t.colors.accentText}
                size={24}
                strokeWidth={1.75}
              />
            </View>
          ) : null}
          <Text variant="title2">{title}</Text>
          {message ? (
            <Text variant="body" tone="secondary">
              {message}
            </Text>
          ) : null}
          <View style={{ gap: t.space[2], marginTop: t.space[4] }}>
            <Button
              label={confirmLabel}
              onPress={onConfirm}
              variant={destructive ? 'danger' : 'primary'}
              haptic={destructive ? 'warning' : 'light'}
              loading={loading}
            />
            {onCancel ? (
              <Button label={cancelLabel} onPress={onCancel} variant="secondary" haptic={false} />
            ) : null}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  card: { width: '100%', maxWidth: 400 },
  icon: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
});
