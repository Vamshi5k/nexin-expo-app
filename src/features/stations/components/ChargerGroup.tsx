import { StyleSheet, View } from 'react-native';

import { ChevronRight } from 'lucide-react-native';
import Animated from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

import { AppConnectorIcon, AppPressable, AppText } from '@/shared/components';

import StatusBadge from './StatusBadge';

import { useTheme, withAlpha } from '@/shared/theme';

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

type ConnectorRowProps = {
  charger: Charger;
  connector: Connector;
  onPress: (charger: Charger, connector: Connector) => void;
};

type ChargeRingProps = {
  percent: number;
};

const RING_STROKE = 3;
const SOFT = 0.12;

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

// One list row per connector: the plug on a soft status circle, type and number, a status badge,
// then Start when it is free or the charge ring while charging. Busy rows end there.
const ConnectorRow = ({ charger, connector, onPress }: ConnectorRowProps) => {
  const t = useTheme();
  const startable = canStartCharging(connector.state);
  const charging = connector.state === 'charging';
  const type = connector.portType ?? DETAILS_COPY.unknownType;
  const main = t.colors.status.connector[connector.state].main;
  const eta = charging ? timeToFull(connector.minutesToFull) : null;
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

      <View style={[styles.grow, { gap: t.space[1] }]}>
        <View style={[styles.row, { gap: t.space[1] + t.space[1] / 2 }]}>
          <AppText
            variant="subhead"
            numberOfLines={1}
            style={[
              styles.shrink,
              { fontFamily: t.type.headline.fontFamily },
              startable || charging ? undefined : { color: t.colors.textSecondary },
            ]}
          >
            {type}
          </AppText>
          <AppText variant="caption" tone="tertiary" tabular>
            {shortConnector(connector.connectorId)}
          </AppText>
        </View>
        <View style={[styles.row, { gap: t.space[2] }]}>
          <StatusBadge label={connector.label} state={connector.state} />
          {eta ? (
            <AppText
              variant="caption"
              tone="secondary"
              tabular
              numberOfLines={1}
              style={styles.shrink}
            >
              {eta}
            </AppText>
          ) : null}
        </View>
      </View>

      {charging && connector.socPercent !== null ? (
        <ChargeRing percent={connector.socPercent} />
      ) : null}
      {startable ? (
        <View
          style={[
            styles.row,
            {
              gap: t.space[1] / 2,
              height: t.space[8],
              paddingLeft: t.space[3],
              paddingRight: t.space[2],
              borderRadius: t.radius.pill,
              backgroundColor: t.colors.textPrimary,
            },
          ]}
        >
          <AppText
            variant="caption"
            style={{ fontFamily: t.type.headline.fontFamily, color: t.colors.surface }}
          >
            {DETAILS_COPY.start}
          </AppText>
          <ChevronRight color={t.colors.surface} size={t.icon.meta} strokeWidth={t.icon.stroke} />
        </View>
      ) : null}
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
