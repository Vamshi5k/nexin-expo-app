import { StyleSheet, View } from 'react-native';

import { ChevronRight, Zap } from 'lucide-react-native';

import { AppPressable, AppText } from '@/shared/components';

import { useTheme, withAlpha, type Theme } from '@/shared/theme';

import { brand } from '@/core/config';
import { formatPaise } from '@/shared/utils/money';

import { HISTORY_COPY, STATUS_COPY } from '../constants/history.constants';
import type { ChargingSession, SessionStatus } from '../types/history.types';
import { formatDateTime, formatDuration, formatKwh } from '../utils/history';

type SessionCardProps = {
  session: ChargingSession;
  onPress: () => void;
};

type TokenProps = {
  label: string;
  bolt?: boolean;
};

const statusTone = (t: Theme, status: SessionStatus) => {
  switch (status) {
    case 'completed':
      return { dot: t.colors.success, ink: t.colors.successText };
    case 'active':
      return { dot: t.colors.accent, ink: t.colors.accentText };
    default:
      return { dot: t.colors.danger, ink: t.colors.dangerText };
  }
};

const Token = ({ label, bolt }: TokenProps) => {
  const t = useTheme();

  return (
    <View
      style={[
        styles.row,
        {
          gap: t.space[1] / 2,
          height: t.space[5],
          paddingHorizontal: t.space[2],
          borderRadius: t.radius.pill,
          backgroundColor: t.colors.surfaceSunken,
        },
      ]}
    >
      {bolt ? (
        <Zap
          color={t.colors.accentText}
          fill={t.colors.accentText}
          size={t.icon.meta - 4}
          strokeWidth={t.icon.stroke}
        />
      ) : null}
      <AppText variant="caption" tabular>
        {label}
      </AppText>
    </View>
  );
};

// One session in the Stations card's language: the station with its address and the cost,
// small tokens for energy, time, connector and power, then a hairline footer with the glowing
// status and the date. Tapping opens the invoice.
const SessionCard = ({ session, onPress }: SessionCardProps) => {
  const t = useTheme();
  const tone = statusTone(t, session.status);
  const station = session.stationName || HISTORY_COPY.unknownStation;
  const when = formatDateTime(session.startedAt, brand.locale);
  const tokens = [
    { key: 'kwh', label: formatKwh(session.energyKwh), bolt: true },
    { key: 'time', label: formatDuration(session.durationMin) },
    {
      key: 'connector',
      label: session.connectorId ? HISTORY_COPY.connector(session.connectorId) : null,
    },
    {
      key: 'power',
      label:
        session.powerKw !== null ? HISTORY_COPY.power(session.powerKw, session.powerType) : null,
    },
  ].filter((token): token is { key: string; label: string; bolt?: boolean } => !!token.label);

  return (
    <AppPressable
      onPress={onPress}
      feedback="opacity"
      accessibilityRole="button"
      accessibilityLabel={[station, STATUS_COPY[session.status], when].filter(Boolean).join(', ')}
      accessibilityHint={HISTORY_COPY.open}
      style={{
        gap: t.space[2] + t.space[1] / 2,
        padding: t.space[3],
        borderRadius: t.radius.card,
        borderWidth: t.layout.hairline,
        borderColor: t.colors.border,
        backgroundColor: t.colors.surfaceRaised,
      }}
    >
      <View style={[styles.top, { gap: t.space[3] }]}>
        <View style={[styles.grow, { gap: t.space[1] / 2 }]}>
          <AppText
            variant="subhead"
            numberOfLines={1}
            style={{ fontFamily: t.type.headline.fontFamily }}
          >
            {station}
          </AppText>
          {session.address ? (
            <AppText variant="caption" tone="secondary" numberOfLines={1}>
              {session.address}
            </AppText>
          ) : null}
        </View>
        {session.costPaise !== null ? (
          <AppText variant="subhead" tabular style={{ fontFamily: t.type.headline.fontFamily }}>
            {formatPaise(session.costPaise)}
          </AppText>
        ) : null}
      </View>

      {tokens.length ? (
        <View style={[styles.wrap, { gap: t.space[1] + t.space[1] / 2 }]}>
          {tokens.map(token => (
            <Token key={token.key} label={token.label} bolt={token.bolt} />
          ))}
        </View>
      ) : null}

      <View
        style={[
          styles.row,
          {
            gap: t.space[2],
            paddingTop: t.space[2] + t.space[1] / 2,
            borderTopWidth: t.layout.hairline,
            borderTopColor: t.colors.border,
          },
        ]}
      >
        <View
          style={{
            width: 8,
            height: 8,
            borderRadius: t.radius.pill,
            backgroundColor: tone.dot,
            boxShadow: `0 0 6px 1px ${withAlpha(tone.dot, 0.55)}`,
          }}
        />
        <AppText
          variant="caption"
          style={{ fontFamily: t.type.headline.fontFamily, color: tone.ink }}
        >
          {STATUS_COPY[session.status]}
        </AppText>
        <View style={styles.grow} />
        {when ? (
          <AppText variant="caption" tone="tertiary" tabular numberOfLines={1}>
            {when}
          </AppText>
        ) : null}
        <ChevronRight
          color={t.colors.textTertiary}
          size={t.icon.meta}
          strokeWidth={t.icon.stroke}
        />
      </View>
    </AppPressable>
  );
};

export default SessionCard;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  top: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  grow: {
    flex: 1,
  },
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
