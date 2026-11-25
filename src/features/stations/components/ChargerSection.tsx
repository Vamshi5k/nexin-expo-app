import { StyleSheet, View } from 'react-native';

import { ChevronRight, PlugZap } from 'lucide-react-native';

import { AppConnectorIcon, AppPressable, AppStatusChip, AppText } from '@/shared/components';

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
  first: boolean;
  onPress: (charger: Charger, connector: Connector) => void;
};

const chargerMeta = (charger: Charger) =>
  [charger.powerType, charger.capacityKw !== null ? `${charger.capacityKw} kW` : null]
    .filter(Boolean)
    .join(' · ');

const ConnectorRow = ({ charger, connector, first, onPress }: ConnectorRowProps) => {
  const t = useTheme();
  const startable = canStartCharging(connector.state);
  const label = CONNECTOR_LABEL[connector.state];
  const progress = chargingProgress(connector);
  const type = connector.portType ?? DETAILS_COPY.unknownType;

  const meta = [
    type,
    charger.pricePerKwhPaise !== null
      ? `${formatRate(charger.pricePerKwhPaise)} ${CARD_COPY.price}`
      : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <AppPressable
      onPress={() => onPress(charger, connector)}
      feedback="opacity"
      accessibilityRole="button"
      accessibilityLabel={`${connectorTitle(connector.connectorId)}, ${type}, ${label}`}
      accessibilityState={{ disabled: !startable }}
      style={[
        styles.row,
        {
          gap: t.space[3],
          paddingVertical: t.space[3],
          borderTopWidth: first ? 0 : t.layout.hairline,
          borderTopColor: t.colors.border,
        },
      ]}
    >
      <View
        style={[
          styles.center,
          {
            width: t.space[12],
            height: t.space[12],
            borderRadius: t.radius.control,
            backgroundColor: startable ? t.colors.accentSoft : t.colors.surfaceSunken,
          },
        ]}
      >
        <AppConnectorIcon type={type} size={t.space[8]} available={startable} />
      </View>

      <View style={[styles.grow, { gap: t.space[1] / 2 }]}>
        <AppText variant="subhead" style={{ fontFamily: t.type.headline.fontFamily }}>
          {connectorTitle(connector.connectorId)}
        </AppText>
        <AppText variant="caption" tone="secondary" numberOfLines={1} tabular>
          {meta}
        </AppText>
        {progress ? (
          <AppText variant="caption" tone="accent" tabular>
            {progress}
          </AppText>
        ) : null}
      </View>

      <AppStatusChip label={label} connector={connectorColorKey(connector.state)} />
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
    <View
      style={{
        padding: t.space[4],
        paddingBottom: t.space[1],
        borderRadius: t.radius.card,
        borderWidth: t.layout.hairline,
        borderColor: t.colors.border,
        backgroundColor: t.colors.surfaceRaised,
      }}
    >
      <View style={[styles.row, { gap: t.space[3], paddingBottom: t.space[2] }]}>
        <View
          style={[
            styles.center,
            {
              width: t.layout.minTouch,
              height: t.layout.minTouch,
              borderRadius: t.radius.control,
              backgroundColor: t.colors.accentSoft,
            },
          ]}
        >
          <PlugZap color={t.colors.accentText} size={t.icon.control} strokeWidth={t.icon.stroke} />
        </View>
        <View style={styles.grow}>
          <AppText variant="headline">{chargerTitle(index)}</AppText>
          <AppText variant="caption" tone="secondary" numberOfLines={1} tabular>
            {[chargerMeta(charger), charger.chargerId].filter(Boolean).join(' · ')}
          </AppText>
        </View>
        {total ? (
          <AppStatusChip label={freeBadge(free, total)} tone={free ? 'success' : 'neutral'} />
        ) : null}
      </View>

      {charger.connectors.map((connector, position) => (
        <ConnectorRow
          key={connector.id}
          charger={charger}
          connector={connector}
          first={position === 0}
          onPress={onConnectorPress}
        />
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
});
