import { StyleSheet, View } from 'react-native';

import { ChevronRight } from 'lucide-react-native';
import Animated from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

import { AppConnectorIcon, AppPressable, AppText } from '@/shared/components';

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
  onConnectorPress: (charger: Charger, connector: Connector) => void;
};

type ConnectorTileProps = {
  charger: Charger;
  connector: Connector;
  onPress: (charger: Charger, connector: Connector) => void;
};

type ChargeRingProps = {
  percent: number;
};

const RING_STROKE = 3;
const DOWN_STATES = ['unavailable', 'faulted', 'offline'];

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

// A row per connector: its plug drawing, short number and type, then the live status. A free one is outlined
// in the accent with a go arrow; charging shows a ring with the %.
const ConnectorTile = ({ charger, connector, onPress }: ConnectorTileProps) => {
  const t = useTheme();
  const startable = canStartCharging(connector.state);
  const charging = connector.state === 'charging';
  const type = connector.portType ?? DETAILS_COPY.unknownType;
  const status = t.colors.status.connector[connector.state];
  const eta = charging ? timeToFull(connector.minutesToFull) : null;
  const down = DOWN_STATES.includes(connector.state);
  const statusText = eta ? `${connector.label} · ${eta}` : connector.label;

  return (
    <AppPressable
      onPress={() => onPress(charger, connector)}
      accessibilityRole="button"
      accessibilityLabel={`${connectorTitle(connector.connectorId)}, ${type}, ${connector.label}`}
      accessibilityState={{ disabled: !startable }}
      style={[
        styles.row,
        {
          gap: t.space[3],
          padding: t.space[2] + t.space[1] / 2,
          paddingRight: t.space[3],
          borderRadius: t.radius.control,
          borderWidth: startable ? t.layout.selectedBorder : t.layout.hairline,
          borderColor: startable ? t.colors.accentText : t.colors.border,
          backgroundColor: startable ? t.colors.accentSoft : t.colors.surface,
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
            borderWidth: t.layout.hairline,
            borderColor: t.colors.border,
            backgroundColor: t.colors.surface,
          },
        ]}
      >
        <AppConnectorIcon type={type} size={t.space[8]} available={startable || charging} />
      </View>

      <View style={[styles.grow, { gap: t.space[1] / 2 }]}>
        <View style={[styles.row, { gap: t.space[2] }]}>
          <AppText variant="caption" tone="secondary" tabular>
            {shortConnector(connector.connectorId)}
          </AppText>
          <AppText
            variant="headline"
            numberOfLines={1}
            style={[
              styles.shrink,
              startable || charging ? undefined : { color: t.colors.textTertiary },
            ]}
          >
            {type}
          </AppText>
        </View>
        <View style={[styles.row, { gap: t.space[2] }]}>
          {charging ? null : <StatusDot color={status.main} />}
          <AppText
            variant="caption"
            numberOfLines={1}
            style={[
              styles.shrink,
              {
                fontFamily: t.type.headline.fontFamily,
                color: charging
                  ? t.colors.accentText
                  : down
                    ? t.colors.dangerText
                    : t.colors.textPrimary,
              },
            ]}
          >
            {statusText}
          </AppText>
        </View>
      </View>

      {charging && connector.socPercent !== null ? (
        <ChargeRing percent={connector.socPercent} />
      ) : null}
      {startable ? (
        <View
          style={[
            styles.center,
            {
              width: t.space[8],
              height: t.space[8],
              borderRadius: t.radius.pill,
              backgroundColor: t.colors.textPrimary,
            },
          ]}
        >
          <ChevronRight color={t.colors.surface} size={t.icon.meta} strokeWidth={t.icon.stroke} />
        </View>
      ) : null}
    </AppPressable>
  );
};

// One charger: name, specs and free count, then each connector on its own full-width row.
const ChargerGroup = ({ charger, index, onConnectorPress }: ChargerGroupProps) => {
  const t = useTheme();
  const free = freeConnectors(charger);
  const total = charger.connectors.length;
  const specs = chargerSpecs(charger);

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
        {charger.connectors.map(connector => (
          <ConnectorTile
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
  grow: {
    flex: 1,
  },
  shrink: {
    flexShrink: 1,
  },
});
