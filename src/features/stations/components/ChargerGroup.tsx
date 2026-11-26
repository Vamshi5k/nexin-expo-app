import { StyleSheet, View } from 'react-native';

import Animated from 'react-native-reanimated';

import { AppConnectorIcon, AppPressable, AppText } from '@/shared/components';

import StatusLabel from './StatusLabel';

import { useTheme, withAlpha } from '@/shared/theme';

import { riseIn } from '@/shared/utils/motion';

import {
  chargerName,
  connectorTitle,
  DETAILS_COPY,
  freeBadge,
} from '../constants/stations.constants';
import type { Charger, Connector } from '../types/stations.types';
import {
  canStartCharging,
  chargerSpecs,
  chargingProgress,
  freeConnectors,
} from '../utils/connector';

type ChargerGroupProps = {
  charger: Charger;
  index: number;
  onConnectorPress: (charger: Charger, connector: Connector) => void;
};

type ConnectorRowProps = {
  charger: Charger;
  connector: Connector;
  onPress: (charger: Charger, connector: Connector) => void;
};

const SOFT = 0.12;

// One list row per connector: the plug on a soft status circle, the type over a light line
// ("Connector 1", or the battery % while charging), and the glowing status on the right.
const ConnectorRow = ({ charger, connector, onPress }: ConnectorRowProps) => {
  const t = useTheme();
  const startable = canStartCharging(connector.state);
  const charging = connector.state === 'charging';
  const type = connector.portType ?? DETAILS_COPY.unknownType;
  const main = t.colors.status.connector[connector.state].main;
  const progress = chargingProgress(connector);
  const plug = t.space[10];

  return (
    <AppPressable
      onPress={() => onPress(charger, connector)}
      feedback="opacity"
      accessibilityRole="button"
      accessibilityLabel={`${connectorTitle(connector.connectorId)}, ${type}, ${connector.label}`}
      accessibilityState={{ disabled: !startable }}
      style={[styles.row, { gap: t.space[3], paddingVertical: t.space[2] + t.space[1] / 2 }]}
    >
      <View
        style={[
          styles.center,
          {
            width: plug,
            height: plug,
            borderRadius: t.radius.pill,
            backgroundColor: withAlpha(main, SOFT),
          },
        ]}
      >
        <AppConnectorIcon type={type} size={t.space[6]} available={startable || charging} />
      </View>

      <View style={[styles.grow, { gap: t.space[1] / 2 }]}>
        <AppText
          variant="subhead"
          numberOfLines={1}
          style={[
            { fontFamily: t.type.headline.fontFamily },
            startable || charging ? undefined : { color: t.colors.textSecondary },
          ]}
        >
          {type}
        </AppText>
        <AppText variant="caption" tone="tertiary" tabular numberOfLines={1}>
          {charging
            ? (progress ?? connectorTitle(connector.connectorId))
            : connectorTitle(connector.connectorId)}
        </AppText>
      </View>

      <StatusLabel label={connector.label} state={connector.state} />
    </AppPressable>
  );
};

// One charger as a single card: name and specs with the free count, a hairline, then its
// connectors as list rows.
const ChargerGroup = ({ charger, index, onConnectorPress }: ChargerGroupProps) => {
  const t = useTheme();
  const free = freeConnectors(charger);
  const total = charger.connectors.length;
  const specs = chargerSpecs(charger);

  return (
    <Animated.View
      entering={riseIn(index + 1)}
      style={{
        paddingHorizontal: t.space[3] + t.space[1],
        borderRadius: t.radius.card,
        borderWidth: t.layout.hairline,
        borderColor: t.colors.border,
        backgroundColor: t.colors.surfaceRaised,
      }}
    >
      <View
        style={[
          styles.row,
          {
            gap: t.space[3],
            paddingVertical: t.space[3],
            borderBottomWidth: t.layout.hairline,
            borderBottomColor: t.colors.border,
          },
        ]}
      >
        <View style={styles.grow}>
          <AppText
            variant="subhead"
            numberOfLines={1}
            style={{ fontFamily: t.type.headline.fontFamily }}
          >
            {chargerName(index)}
          </AppText>
          {specs ? (
            <AppText variant="caption" tone="secondary" tabular numberOfLines={1}>
              {specs}
            </AppText>
          ) : null}
        </View>
        {total ? (
          <AppText
            variant="caption"
            tabular
            style={{
              fontFamily: t.type.headline.fontFamily,
              color: free ? t.colors.successText : t.colors.textTertiary,
            }}
          >
            {freeBadge(free, total)}
          </AppText>
        ) : null}
      </View>

      <View style={{ paddingVertical: t.space[1] }}>
        {charger.connectors.map((connector, position) => (
          <View key={connector.id}>
            {position ? (
              <View
                style={{
                  height: t.layout.hairline,
                  marginLeft: t.space[10] + t.space[3],
                  backgroundColor: t.colors.border,
                }}
              />
            ) : null}
            <ConnectorRow charger={charger} connector={connector} onPress={onConnectorPress} />
          </View>
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
  grow: {
    flex: 1,
  },
  shrink: {
    flexShrink: 1,
  },
});
