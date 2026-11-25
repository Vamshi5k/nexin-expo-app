import type { LucideIcon } from 'lucide-react-native';
import { Check } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import type { PermissionResult } from '@/core/permissions';
import { useTheme } from '@/shared/theme';
import { AppButton, AppText } from '@/shared/components';

// Flat card: sunken at rest, tinted with a check once allowed. No shadow.
export function PermissionCard({
  icon: Icon,
  title,
  description,
  status,
  pending,
  onAllow,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  status: PermissionResult | null;
  pending: boolean;
  onAllow: () => void;
}) {
  const t = useTheme();
  const c = t.colors;
  const granted = status === 'granted';
  return (
    <View
      style={[
        {
          padding: t.space[4],
          gap: t.space[4],
          borderRadius: t.radius.card,
          backgroundColor: granted ? c.accentSoft : c.surfaceSunken,
        },
      ]}
    >
      <View style={[styles.row, { gap: t.space[3] }]}>
        <View
          style={[
            styles.tile,
            { borderRadius: t.radius.control, backgroundColor: granted ? c.accent : c.surface },
          ]}
        >
          <Icon color={granted ? c.onAccent : c.accentText} size={22} strokeWidth={1.75} />
        </View>
        <View style={[styles.flex, { gap: t.space[1] }]}>
          <AppText variant="headline">{title}</AppText>
          <AppText variant="callout" tone="secondary">
            {description}
          </AppText>
        </View>
      </View>
      {granted ? (
        <View style={[styles.row, { gap: t.space[2] }]} accessibilityLiveRegion="polite">
          <View style={[styles.check, { backgroundColor: c.accent, borderRadius: t.radius.pill }]}>
            <Check color={c.onAccent} size={14} strokeWidth={3} />
          </View>
          <AppText variant="subhead" tone="accent">
            Allowed
          </AppText>
        </View>
      ) : (
        <AppButton
          label={status === 'blocked' ? 'Open Settings' : 'Allow'}
          variant="secondary"
          size="medium"
          fullWidth
          loading={pending}
          disabled={status === null}
          onPress={onAllow}
          accessibilityHint={`Allow ${title.toLowerCase()} access`}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  flex: { flex: 1 },
  tile: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  check: { width: 22, height: 22, alignItems: 'center', justifyContent: 'center' },
});
