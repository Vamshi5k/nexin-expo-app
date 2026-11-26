import { StyleSheet, View } from 'react-native';

import { ChevronRight, Zap } from 'lucide-react-native';
import Animated from 'react-native-reanimated';

import { AppConnectorIcon, AppPressable, AppText } from '@/shared/components';

import StatusDot from './StatusDot';

import { useTheme } from '@/shared/theme';

import { formatRate } from '@/shared/utils/money';
import { riseIn } from '@/shared/utils/motion';

import {
  CARD_COPY,
  chargerTitle,
  connectorTitle,
  DETAILS_COPY,
  freeBadge,
} from '../constants/stations.constants';
import type { Charger, Connector } from '../types/stations.types';
import { canStartCharging, chargingProgress, freeConnectors } from '../utils/connector';

type ChargerGroupProps = {
  charger: Charger;
  index: number;
  onConnectorPress: (charger: Charger, connector: Connector) => void;
};

type ConnectorCardProps = {
  charger: Charger;
  connector: Connector;
  onPress: (charger: Charger, connector: Connector) => void;
};

const chargerMeta = (charger: Charger) =>
  [
    charger.powerType,
    charger.capacityKw !== null ? `${charger.capacityKw} kW` : null,
    charger.pricePerKwhPaise !== null
      ? `${formatRate(charger.pricePerKwhPaise)}${CARD_COPY.price}`
      : null,
  ]
    .filter(Boolean)
    .join(' · ');

// One connector per row: a status-tinted plug tile, its type and number, the live status, and a
// chevron only when it can start a session. Charging shows the battery filling.
const ConnectorCard = ({ charger, connector, onPress }: ConnectorCardProps) => {
  const t = useTheme();
  const startable = canStartCharging(connector.state);
  const type = connector.portType ?? DETAILS_COPY.unknownType;
  const progress = chargingProgress(connector);
  const status = t.colors.status.connector[connector.state];

  return (
    <AppPressable
      onPress={() => onPress(charger, connector)}
      accessibilityRole="button"
      accessibilityLabel={`${connectorTitle(connector.connectorId)}, ${type}, ${connector.label}`}
      accessibilityState={{ disabled: !startable }}
      style={{
        gap: t.space[3],
        padding: t.space[3],
        borderRadius: t.radius.control,
        borderWidth: t.layout.hairline,
        borderColor: startable ? status.main : t.colors.border,
        backgroundColor: t.colors.surface,
      }}
    >
      <View style={[styles.row, { gap: t.space[3] }]}>
        <View
          style={[
            styles.center,
            {
              width: t.space[12],
              height: t.space[12],
              borderRadius: t.radius.control,
              backgroundColor: status.tint,
            },
          ]}
        >
          <AppConnectorIcon type={type} size={t.space[6] + t.space[1]} available={startable} />
        </View>

        <View style={[styles.grow, { gap: t.space[1] / 2 }]}>
          <AppText
            variant="subhead"
            numberOfLines={1}
            style={{ fontFamily: t.type.headline.fontFamily }}
          >
            {type}
          </AppText>
          <AppText variant="caption" tone="secondary" numberOfLines={1}>
            {connectorTitle(connector.connectorId)}
          </AppText>
        </View>

        <View
          style={[
            styles.row,
            styles.shrink,
            {
              gap: t.space[2],
              paddingHorizontal: t.space[2] + t.space[1] / 2,
              paddingVertical: t.space[1],
              borderRadius: t.radius.pill,
              backgroundColor: status.tint,
            },
          ]}
        >
          <StatusDot color={status.main} live={connector.state === 'charging'} />
          <AppText variant="caption" numberOfLines={1} style={styles.shrink}>
            {connector.label}
          </AppText>
        </View>

        {startable ? (
          <ChevronRight
            color={t.colors.textTertiary}
            size={t.icon.meta}
            strokeWidth={t.icon.stroke}
          />
        ) : null}
      </View>

      {progress ? (
        <View style={{ gap: t.space[1] }}>
          {connector.socPercent !== null ? (
            <View
              style={[
                styles.track,
                {
                  height: t.space[1],
                  borderRadius: t.radius.pill,
                  backgroundColor: t.colors.surfaceSunken,
                },
              ]}
            >
              <View
                style={{
                  width: `${Math.min(100, Math.max(0, connector.socPercent))}%`,
                  height: '100%',
                  borderRadius: t.radius.pill,
                  backgroundColor: status.main,
                }}
              />
            </View>
          ) : null}
          <AppText variant="caption" tone="secondary" tabular>
            {progress}
          </AppText>
        </View>
      ) : null}
    </AppPressable>
  );
};

// One charger as its own card: name, power and price, free count, then every connector under it.
const ChargerGroup = ({ charger, index, onConnectorPress }: ChargerGroupProps) => {
  const t = useTheme();
  const free = freeConnectors(charger);
  const total = charger.connectors.length;
  const meta = chargerMeta(charger);

  return (
    <Animated.View
      entering={riseIn(index + 1)}
      style={{
        gap: t.space[3],
        padding: t.space[3],
        borderRadius: t.radius.card,
        borderWidth: t.layout.hairline,
        borderColor: t.colors.border,
        backgroundColor: t.colors.surfaceRaised,
      }}
    >
      <View style={[styles.row, { gap: t.space[3] }]}>
        <View
          style={[
            styles.center,
            {
              width: t.space[8] + t.space[1],
              height: t.space[8] + t.space[1],
              borderRadius: t.radius.pill,
              backgroundColor: t.colors.accentSoft,
            },
          ]}
        >
          <Zap
            color={t.colors.accentText}
            fill={t.colors.accentText}
            size={t.icon.meta}
            strokeWidth={t.icon.stroke}
          />
        </View>
        <View style={styles.grow}>
          <AppText variant="headline" numberOfLines={1}>
            {chargerTitle(index)}
          </AppText>
          {meta ? (
            <AppText variant="caption" tone="secondary" tabular numberOfLines={1}>
              {meta}
            </AppText>
          ) : null}
        </View>
        {total ? (
          <View
            style={{
              paddingHorizontal: t.space[2] + t.space[1] / 2,
              paddingVertical: t.space[1],
              borderRadius: t.radius.pill,
              backgroundColor: free
                ? t.colors.status.connector.available.tint
                : t.colors.surfaceSunken,
            }}
          >
            <AppText
              variant="caption"
              tabular
              style={{ color: free ? t.colors.successText : t.colors.textTertiary }}
            >
              {freeBadge(free, total)}
            </AppText>
          </View>
        ) : null}
      </View>

      <View style={{ gap: t.space[2] }}>
        {charger.connectors.map(connector => (
          <ConnectorCard
            key={connector.id}
            charger={charger}
            connector={connector}
            onPress={onConnectorPress}
          />
        ))}
      </View>
    </Animated.View>
  );
};

export default ChargerGroup;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  shrink: {
    flexShrink: 1,
  },
  grow: {
    flex: 1,
  },
  track: {
    overflow: 'hidden',
  },
});
