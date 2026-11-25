import { StyleSheet, View } from 'react-native';

import { AppText } from '@/shared/components';

import { useTheme } from '@/shared/theme';

import { allInUse, freeOfTotal, STATUS_COPY } from '../constants/stations.constants';
import type { Badge, BadgeKind } from '../utils/status';

type StationStatusLineProps = {
  badge: Badge;
};

type Tone = 'success' | 'warning' | 'danger' | 'neutral';

const TONE: Record<BadgeKind, Tone> = {
  free: 'success',
  online: 'success',
  busy: 'warning',
  soon: 'warning',
  service: 'warning',
  offline: 'danger',
  unknown: 'neutral',
};

const statusText = (badge: Badge) => {
  if (badge.kind === 'free') return `${STATUS_COPY.free} · ${freeOfTotal(badge.free, badge.total)}`;
  if (badge.kind === 'busy') return `${STATUS_COPY.busy} · ${allInUse(badge.total)}`;
  return STATUS_COPY[badge.kind];
};

// The first thing a driver reads: can I charge there right now.
const StationStatusLine = ({ badge }: StationStatusLineProps) => {
  const t = useTheme();

  const tones: Record<Tone, { dot: string; fg: string }> = {
    success: { dot: t.colors.success, fg: t.colors.successText },
    warning: { dot: t.colors.warning, fg: t.colors.warningText },
    danger: { dot: t.colors.danger, fg: t.colors.dangerText },
    neutral: { dot: t.colors.textTertiary, fg: t.colors.textSecondary },
  };
  const tone = tones[TONE[badge.kind]];

  return (
    <View style={[styles.row, { gap: t.space[2] }]}>
      <View
        style={{
          width: t.space[2],
          height: t.space[2],
          borderRadius: t.radius.pill,
          backgroundColor: tone.dot,
        }}
      />
      <AppText variant="subhead" numberOfLines={1} tabular style={{ color: tone.fg }}>
        {statusText(badge)}
      </AppText>
    </View>
  );
};

export default StationStatusLine;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
