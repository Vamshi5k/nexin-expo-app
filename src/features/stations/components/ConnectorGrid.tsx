import { StyleSheet, View } from 'react-native';

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

type ConnectorGridProps = {
  charger: Charger;
  index: number;
  onConnectorPress: (charger: Charger, connector: Connector) => void;
};

type BayProps = {
  charger: Charger;
  connector: Connector;
  onPress: (charger: Charger, connector: Connector) => void;
};

const chargerMeta = (charger: Charger) =>
  [charger.powerType, charger.capacityKw !== null ? `${charger.capacityKw} kW` : null]
    .filter(Boolean)
    .join(' · ');

// One connector as a charging bay: free bays carry the brand tint, the rest stay muted.
const Bay = ({ charger, connector, onPress }: BayProps) => {
  const t = useTheme();
  const startable = canStartCharging(connector.state);
  const label = CONNECTOR_LABEL[connector.state];
  const type = connector.portType ?? DETAILS_COPY.unknownType;
  const progress = chargingProgress(connector);
  const statusColor = t.colors.connector[connectorColorKey(connector.state)];

  return (
    <AppPressable
      onPress={() => onPress(charger, connector)}
      accessibilityRole="button"
      accessibilityLabel={`${connectorTitle(connector.connectorId)}, ${type}, ${label}`}
      accessibilityState={{ disabled: !startable }}
      style={[
        styles.bay,
        {
          gap: t.space[3],
          padding: t.space[4],
          borderRadius: t.radius.card,
          borderWidth: t.layout.selectedBorder,
          borderColor: startable ? t.colors.accent : t.colors.border,
          backgroundColor: startable ? t.colors.accentSoft : t.colors.surfaceRaised,
        },
      ]}
    >
      <View style={[styles.row, styles.between]}>
        <AppConnectorIcon type={type} size={t.space[8] + t.space[1]} available={startable} />
        <AppText variant="headline" tone={startable ? 'accent' : 'tertiary'}>
          {`C${connector.connectorId}`}
        </AppText>
      </View>

      <View style={{ gap: t.space[1] / 2 }}>
        <AppText variant="headline" numberOfLines={1}>
          {type}
        </AppText>
        {charger.pricePerKwhPaise !== null ? (
          <AppText variant="subhead" tone="secondary" tabular>
            {`${formatRate(charger.pricePerKwhPaise)} ${CARD_COPY.price}`}
          </AppText>
        ) : null}
      </View>

      <View style={[styles.row, { gap: t.space[2] }]}>
        <View
          style={{
            width: t.space[2],
            height: t.space[2],
            borderRadius: t.radius.pill,
            backgroundColor: statusColor,
          }}
        />
        <AppText variant="caption" tone="secondary" numberOfLines={1} style={styles.grow}>
          {progress ?? label}
        </AppText>
      </View>
    </AppPressable>
  );
};

const ConnectorGrid = ({ charger, index, onConnectorPress }: ConnectorGridProps) => {
  const t = useTheme();
  const free = freeConnectors(charger);
  const total = charger.connectors.length;

  return (
    <View style={{ gap: t.space[3] }}>
      <View style={[styles.row, { gap: t.space[2] }]}>
        <View style={styles.grow}>
          <AppText variant="headline">{chargerTitle(index)}</AppText>
          <AppText variant="caption" tone="secondary" numberOfLines={1} tabular>
            {[chargerMeta(charger), charger.chargerId].filter(Boolean).join(' · ')}
          </AppText>
        </View>
        {total ? (
          <AppText
            variant="subhead"
            tabular
            style={{ color: free ? t.colors.successText : t.colors.textTertiary }}
          >
            {freeBadge(free, total)}
          </AppText>
        ) : null}
      </View>

      <View style={[styles.grid, { gap: t.space[3] }]}>
        {charger.connectors.map(connector => (
          <Bay
            key={connector.id}
            charger={charger}
            connector={connector}
            onPress={onConnectorPress}
          />
        ))}
      </View>
    </View>
  );
};

export default ConnectorGrid;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  between: {
    justifyContent: 'space-between',
  },
  grow: {
    flex: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  bay: {
    flexBasis: '46%',
    flexGrow: 1,
  },
});
