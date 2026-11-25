import { StyleSheet, View } from 'react-native';

import {
  CalendarClock,
  CircleHelp,
  Clock,
  Wrench,
  Zap,
  ZapOff,
  type LucideIcon,
} from 'lucide-react-native';

import { AppText } from '@/shared/components';

import { useTheme } from '@/shared/theme';

import { BADGE_COPY } from '../constants/stations.constants';
import type { Badge, BadgeKind } from '../utils/status';

type StationBadgeProps = {
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

const ICON: Record<Exclude<BadgeKind, 'free'>, LucideIcon> = {
  online: Zap,
  busy: Clock,
  soon: CalendarClock,
  service: Wrench,
  offline: ZapOff,
  unknown: CircleHelp,
};

// The signature detail: a bay-sign plate with the live state of the station.
const StationBadge = ({ badge }: StationBadgeProps) => {
  const t = useTheme();

  const colors: Record<Tone, { bg: string; fg: string }> = {
    success: { bg: t.colors.successSoft, fg: t.colors.successText },
    warning: { bg: t.colors.warningSoft, fg: t.colors.warningText },
    danger: { bg: t.colors.dangerSoft, fg: t.colors.dangerText },
    neutral: { bg: t.colors.surfaceSunken, fg: t.colors.textSecondary },
  };
  const { bg, fg } = colors[TONE[badge.kind]];

  // Nested radius: the card's corner minus its padding, so both corners run parallel.
  const radius = t.radius.card - t.space[4];
  const size = t.space[12] + t.space[2];

  return (
    <View
      style={[
        styles.plate,
        { width: size, height: size, borderRadius: radius, backgroundColor: bg },
      ]}
    >
      {badge.kind === 'free' ? (
        <AppText variant="headline" tabular style={{ color: fg }}>
          {badge.free}/{badge.total}
        </AppText>
      ) : (
        <BadgeIcon Icon={ICON[badge.kind]} color={fg} />
      )}
      <AppText variant="caption" numberOfLines={1} style={{ color: fg }}>
        {BADGE_COPY[badge.kind]}
      </AppText>
    </View>
  );
};

type BadgeIconProps = { Icon: LucideIcon; color: string };

const BadgeIcon = ({ Icon, color }: BadgeIconProps) => {
  const t = useTheme();
  return <Icon color={color} size={t.icon.meta} strokeWidth={t.icon.stroke} />;
};

export default StationBadge;

const styles = StyleSheet.create({
  plate: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
