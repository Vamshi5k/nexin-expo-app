import { StyleSheet, View } from 'react-native';

import { Check } from 'lucide-react-native';
import Animated from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

import { AppPressable, AppText } from '@/shared/components';

import StatusDot from './StatusDot';

import { useTheme } from '@/shared/theme';

import { riseIn } from '@/shared/utils/motion';

import {
  chargerName,
  connectorTitle,
  DETAILS_COPY,
  freeBadge,
  shortConnector,
} from '../constants/stations.constants';
import type { Charger, Connector } from '../types/stations.types';
import { canStartCharging, chargerSpecs, freeConnectors, timeToFull } from '../utils/connector';

type ChargerGroupProps = {
  charger: Charger;
  index: number;
  pickedId: string | null;
  onConnectorPress: (charger: Charger, connector: Connector) => void;
};

type ConnectorTileProps = {
  charger: Charger;
  connector: Connector;
  picked: boolean;
  onPress: (charger: Charger, connector: Connector) => void;
};

type ChargeRingProps = {
  percent: number;
};

const RING_STROKE = 3;

const ChargeRing = ({ percent }: ChargeRingProps) => {
  const t = useTheme();
  const size = t.space[8] + t.space[1];
  const radius = (size - RING_STROKE) / 2;
  const length = 2 * Math.PI * radius;
  const clamped = Math.min(100, Math.max(0, percent));

  return (
    <View style={[styles.center, { width: size, height: size }]}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={t.colors.surfaceSunken}
          strokeWidth={RING_STROKE}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={t.colors.accentText}
          strokeWidth={RING_STROKE}
          strokeLinecap="round"
          strokeDasharray={`${(length * clamped) / 100} ${length}`}
          rotation={-90}
          origin={`${size / 2}, ${size / 2}`}
          fill="none"
        />
      </Svg>
      <AppText variant="caption" tabular style={{ fontFamily: t.type.headline.fontFamily }}>
        {`${clamped}%`}
      </AppText>
    </View>
  );
};

// A tile per connector: its short number, the type large and the live status. The pick for
// slide-to-charge is outlined in the accent with a check; charging shows a ring with the %.
const ConnectorTile = ({ charger, connector, picked, onPress }: ConnectorTileProps) => {
  const t = useTheme();
  const startable = canStartCharging(connector.state);
  const charging = connector.state === 'charging';
  const type = connector.portType ?? DETAILS_COPY.unknownType;
  const status = t.colors.status.connector[connector.state];
  const eta = charging ? timeToFull(connector.minutesToFull) : null;
  const statusText = eta ? `${connector.label} · ${eta}` : connector.label;

  return (
    <AppPressable
      onPress={() => onPress(charger, connector)}
      accessibilityRole="button"
      accessibilityLabel={`${connectorTitle(connector.connectorId)}, ${type}, ${connector.label}`}
      accessibilityState={{ disabled: !startable, selected: picked }}
      style={[
        styles.grow,
        {
          gap: t.space[1],
          padding: t.space[3],
          borderRadius: t.radius.control,
          borderWidth: picked ? t.layout.selectedBorder : t.layout.hairline,
          borderColor: picked ? t.colors.accentText : t.colors.border,
          backgroundColor: picked ? t.colors.accentSoft : t.colors.surface,
        },
      ]}
    >
      <View style={[styles.row, styles.between, { minHeight: t.space[8] + t.space[1] }]}>
        <AppText variant="caption" tone="secondary" tabular>
          {shortConnector(connector.connectorId)}
        </AppText>
        {picked ? (
          <View
            style={[
              styles.center,
              {
                width: t.space[5],
                height: t.space[5],
                borderRadius: t.radius.pill,
                backgroundColor: t.colors.accent,
              },
            ]}
          >
            <Check color={t.colors.onAccent} size={t.icon.meta - 4} strokeWidth={2.5} />
          </View>
        ) : null}
        {charging && connector.socPercent !== null ? (
          <ChargeRing percent={connector.socPercent} />
        ) : null}
      </View>

      <AppText
        variant="headline"
        numberOfLines={1}
        style={startable || charging ? undefined : { color: t.colors.textTertiary }}
      >
        {type}
      </AppText>

      <View style={[styles.row, { gap: t.space[2] }]}>
        {charging ? null : <StatusDot color={status.main} />}
        <AppText
          variant="caption"
          numberOfLines={2}
          style={[
            styles.shrink,
            {
              fontFamily: t.type.headline.fontFamily,
              color: charging ? t.colors.accentText : t.colors.textPrimary,
            },
          ]}
        >
          {statusText}
        </AppText>
      </View>
    </AppPressable>
  );
};

// A charger with something free or charging: name, specs and free count, then its connectors
// two per row.
const ChargerGroup = ({ charger, index, pickedId, onConnectorPress }: ChargerGroupProps) => {
  const t = useTheme();
  const free = freeConnectors(charger);
  const total = charger.connectors.length;
  const specs = chargerSpecs(charger, 'price');

  const rows = charger.connectors.reduce<Connector[][]>((all, connector, position) => {
    if (position % 2 === 0) all.push([connector]);
    else all[all.length - 1]!.push(connector);
    return all;
  }, []);

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
      <View style={[styles.row, { gap: t.space[3], paddingHorizontal: t.space[1] }]}>
        <View style={styles.grow}>
          <AppText variant="headline" numberOfLines={1}>
            {chargerName(index)}
          </AppText>
          {specs ? (
            <AppText variant="caption" tone="secondary" tabular numberOfLines={1}>
              {specs}
            </AppText>
          ) : null}
        </View>
        {total ? (
          <View
            style={{
              paddingHorizontal: t.space[2] + t.space[1] / 2,
              paddingVertical: t.space[1] / 2,
              borderRadius: t.radius.pill,
              borderWidth: t.layout.hairline,
              borderColor: free ? t.colors.success : t.colors.border,
              backgroundColor: free ? t.colors.successSoft : t.colors.surfaceSunken,
            }}
          >
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
          </View>
        ) : null}
      </View>

      <View style={{ gap: t.space[2] }}>
        {rows.map(row => (
          <View key={row[0]!.id} style={[styles.stretch, { gap: t.space[2] }]}>
            {row.map(connector => (
              <ConnectorTile
                key={connector.id}
                charger={charger}
                connector={connector}
                picked={connector.id === pickedId}
                onPress={onConnectorPress}
              />
            ))}
            {row.length === 1 && total > 1 ? <View style={styles.grow} /> : null}
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
  stretch: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  between: {
    justifyContent: 'space-between',
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
