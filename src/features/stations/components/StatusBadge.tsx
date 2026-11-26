import { StyleSheet, View } from 'react-native';

import { AppText } from '@/shared/components';

import StatusDot from './StatusDot';

import { useTheme, withAlpha, type Theme } from '@/shared/theme';

import type { ConnectorState } from '@brand/schema';

type StatusBadgeProps = {
  label: string;
  state: ConnectorState;
};

const SOFT = 0.14;

// Text colour per state: a readable shade of the badge's own colour family.
const inkFor = (t: Theme, state: ConnectorState) => {
  switch (state) {
    case 'available':
      return t.colors.successText;
    case 'charging':
    case 'finishing':
    case 'engaged':
      return t.colors.accentText;
    case 'preparing':
    case 'suspendedEv':
    case 'suspendedEvse':
    case 'reserved':
      return t.colors.warningText;
    case 'unavailable':
    case 'faulted':
    case 'offline':
      return t.colors.dangerText;
    default:
      return t.colors.textSecondary;
  }
};

// A soft pill in the state's colour with a dot (pulsing while charging) and the label.
const StatusBadge = ({ label, state }: StatusBadgeProps) => {
  const t = useTheme();
  const main = t.colors.status.connector[state].main;

  return (
    <View
      style={[
        styles.badge,
        {
          gap: t.space[1] + t.space[1] / 2,
          height: t.space[6],
          paddingHorizontal: t.space[2] + t.space[1] / 2,
          borderRadius: t.radius.pill,
          backgroundColor: withAlpha(main, SOFT),
        },
      ]}
    >
      <StatusDot color={main} live={state === 'charging'} />
      <AppText
        variant="caption"
        numberOfLines={1}
        style={[styles.shrink, { fontFamily: t.type.headline.fontFamily, color: inkFor(t, state) }]}
      >
        {label}
      </AppText>
    </View>
  );
};

export default StatusBadge;

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    flexShrink: 1,
  },
  shrink: {
    flexShrink: 1,
  },
});
