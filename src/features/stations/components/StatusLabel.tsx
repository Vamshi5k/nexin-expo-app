import { StyleSheet, View } from 'react-native';

import { AppText } from '@/shared/components';

import StatusDot from './StatusDot';

import { useTheme, type Theme } from '@/shared/theme';

import type { ConnectorState } from '@brand/schema';

type StatusLabelProps = {
  label: string;
  state: ConnectorState;
};

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

// A glowing dot in the state's colour and the label in a readable shade of it, with no pill
// behind. The dot pulses while charging.
const StatusLabel = ({ label, state }: StatusLabelProps) => {
  const t = useTheme();
  const main = t.colors.status.connector[state].main;

  return (
    <View style={[styles.row, { gap: t.space[2] }]}>
      <StatusDot color={main} glow live={state === 'charging'} />
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

export default StatusLabel;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  shrink: {
    flexShrink: 1,
  },
});
