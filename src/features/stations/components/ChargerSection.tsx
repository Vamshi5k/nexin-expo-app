import { StyleSheet, View } from 'react-native';

import { ChevronRight } from 'lucide-react-native';

import { AppConnectorIcon, AppPressable, AppText } from '@/shared/components';

import { useTheme } from '@/shared/theme';

import { formatRate } from '@/shared/utils/money';

import {
  CARD_COPY,
  chargerTitle,
  connectorTitle,
  DETAILS_COPY,
  freeBadge,
} from '../constants/stations.constants';
import type { Charger, Connector } from '../types/stations.types';
import {
  canStartCharging,
  chargingProgress,
  CONNECTOR_LABEL,
  connectorColorKey,
  freeConnectors,
} from '../utils/connector';

type ChargerSectionProps = {
  charger: Charger;
  index: number;
  onConnectorPress: (charger: Charger, connector: Connector) => void;
};

type ConnectorRowProps = {
  charger: Charger;
  connector: Connector;
  onPress: (charger: Charger, connector: Connector) => void;
};

const powerLabel = (charger: Charger) =>
  [charger.capacityKw !== null ? `${charger.capacityKw} kW` : null, charger.powerType]
    .filter(Boolean)
    .join(' ');

// One Uber-style list row: icon circle, bold title, quiet subtitle, price and status on the right.
const ConnectorRow = ({ charger, connector, onPress }: ConnectorRowProps) => {
  const t = useTheme();
  const startable = canStartCharging(connector.state);
  const label = CONNECTOR_LABEL[connector.state];
  const type = connector.portType ?? DETAILS_COPY.unknownType;
  const progress = chargingProgress(connector);
  const statusColor = t.colors.connector[connectorColorKey(connector.state)];

  const title = [type, powerLabel(charger)].filter(Boolean).join(' · ');
  const subtitle = progress ?? connectorTitle(connector.connectorId);

  return (
    <AppPressable
      onPress={() => onPress(charger, connector)}
      feedback="opacity"
      accessibilityRole="button"
      accessibilityLabel={`${connectorTitle(connector.connectorId)}, ${type}, ${label}`}
      accessibilityState={{ disabled: !startable }}
      style={[styles.row, { gap: t.space[3], paddingVertical: t.space[3] }]}
    >
      <View
        style={[
          styles.center,
          {
            width: t.space[12],
            height: t.space[12],
            borderRadius: t.radius.pill,
            backgroundColor: t.colors.surfaceSunken,
          },
        ]}
      >
        <AppConnectorIcon type={type} size={t.space[6] + t.space[1]} available={startable} />
      </View>

      <View style={styles.grow}>
        <AppText variant="headline" numberOfLines={1}>
          {title}
        </AppText>
        <AppText
          variant="subhead"
          tone={progress ? 'accent' : 'secondary'}
          numberOfLines={1}
          tabular
        >
          {subtitle}
        </AppText>
      </View>

      <View style={styles.end}>
        {charger.pricePerKwhPaise !== null ? (
          <AppText variant="headline" tabular>
            {formatRate(charger.pricePerKwhPaise)}
            <AppText variant="caption" tone="tertiary">
              {` ${CARD_COPY.price}`}
            </AppText>
          </AppText>
        ) : null}
        <View style={[styles.row, { gap: t.space[1] }]}>
          <View
            style={{
              width: t.space[2],
              height: t.space[2],
              borderRadius: t.radius.pill,
              backgroundColor: statusColor,
            }}
          />
          <AppText variant="caption" tone="secondary">
            {label}
          </AppText>
        </View>
      </View>

      {startable ? (
        <ChevronRight
          color={t.colors.textTertiary}
          size={t.icon.control}
          strokeWidth={t.icon.stroke}
        />
      ) : null}
    </AppPressable>
  );
};

const ChargerSection = ({ charger, index, onConnectorPress }: ChargerSectionProps) => {
  const t = useTheme();
  const free = freeConnectors(charger);
  const total = charger.connectors.length;

  return (
    <View>
      <View style={[styles.row, { gap: t.space[2], paddingBottom: t.space[1] }]}>
        <AppText variant="subhead" tone="secondary" style={styles.grow} numberOfLines={1}>
          {[chargerTitle(index), charger.chargerId].join(' · ')}
        </AppText>
        {total ? (
          <AppText
            variant="caption"
            tabular
            style={{ color: free ? t.colors.successText : t.colors.textTertiary }}
          >
            {freeBadge(free, total)}
          </AppText>
        ) : null}
      </View>

      {charger.connectors.map((connector, position) => (
        <View
          key={connector.id}
          style={{
            borderTopWidth: position === 0 ? 0 : t.layout.hairline,
            borderTopColor: t.colors.border,
          }}
        >
          <ConnectorRow charger={charger} connector={connector} onPress={onConnectorPress} />
        </View>
      ))}
    </View>
  );
};

export default ChargerSection;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  grow: {
    flex: 1,
  },
  end: {
    alignItems: 'flex-end',
  },
});
