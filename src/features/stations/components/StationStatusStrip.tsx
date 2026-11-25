import { StyleSheet, View } from 'react-native';

import { AppText } from '@/shared/components';

import { useTheme } from '@/shared/theme';

import { allInUse, freeOfTotal, STATUS_COPY } from '../constants/stations.constants';
import type { Badge, BadgeKind } from '../utils/status';

type StationStatusStripProps = {
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

// More dashes than this stop reading as single connectors.
const MAX_DASHES = 6;

const countLabel = (badge: Badge) => {
  if (badge.kind === 'free') return freeOfTotal(badge.free, badge.total);
  if (badge.kind === 'busy') return allInUse(badge.total);
  return null;
};

const StationStatusStrip = ({ badge }: StationStatusStripProps) => {
  const t = useTheme();

  const tones: Record<Tone, { bg: string; fill: string; fg: string }> = {
    success: { bg: t.colors.successSoft, fill: t.colors.success, fg: t.colors.successText },
    warning: { bg: t.colors.warningSoft, fill: t.colors.warning, fg: t.colors.warningText },
    danger: { bg: t.colors.dangerSoft, fill: t.colors.danger, fg: t.colors.dangerText },
    neutral: {
      bg: t.colors.surfaceSunken,
      fill: t.colors.textTertiary,
      fg: t.colors.textSecondary,
    },
  };
  const tone = tones[TONE[badge.kind]];

  // One dash per connector: free ones filled when some are free, all filled when all are busy.
  const total = badge.kind === 'free' || badge.kind === 'busy' ? badge.total : 0;
  const dashes = Math.min(total, MAX_DASHES);
  const filled = badge.kind === 'free' ? Math.round((badge.free / badge.total) * dashes) : dashes;
  const count = countLabel(badge);

  return (
    <View
      style={[
        styles.strip,
        {
          gap: t.space[2],
          paddingVertical: t.space[2],
          paddingHorizontal: t.space[3],
          borderRadius: t.radius.control,
          backgroundColor: tone.bg,
        },
      ]}
    >
      <View
        style={{
          width: t.space[2],
          height: t.space[2],
          borderRadius: t.radius.pill,
          backgroundColor: tone.fill,
        }}
      />
      <AppText variant="subhead" numberOfLines={1} style={{ color: tone.fg }}>
        {STATUS_COPY[badge.kind]}
      </AppText>

      {dashes ? (
        <View style={[styles.dashes, { gap: t.space[1], marginLeft: t.space[1] }]}>
          {Array.from({ length: dashes }, (_, index) => (
            <View
              key={index}
              style={{
                width: t.space[4],
                height: t.space[1],
                borderRadius: t.radius.pill,
                backgroundColor: index < filled ? tone.fill : t.colors.border,
              }}
            />
          ))}
        </View>
      ) : null}

      <View style={styles.grow} />

      {count ? (
        <AppText variant="caption" tabular numberOfLines={1} style={{ color: tone.fg }}>
          {count}
        </AppText>
      ) : null}
    </View>
  );
};

export default StationStatusStrip;

const styles = StyleSheet.create({
  strip: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dashes: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  grow: {
    flex: 1,
  },
});
