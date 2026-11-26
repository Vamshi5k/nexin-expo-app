import { StyleSheet, View } from 'react-native';

import { ArrowUpRight, Zap } from 'lucide-react-native';
import Animated from 'react-native-reanimated';

import { AppConnectorIcon, AppPressable, AppText } from '@/shared/components';

import StatusDot from './StatusDot';

import { useTheme, withAlpha } from '@/shared/theme';

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

type ConnectorTileProps = {
  charger: Charger;
  connector: Connector;
  wide: boolean;
  onPress: (charger: Charger, connector: Connector) => void;
};

type SpecProps = {
  label: string;
};

const SOFT = 0.12;

const pairs = <T,>(items: T[]) =>
  items.reduce<T[][]>((rows, item, position) => {
    if (position % 2 === 0) rows.push([item]);
    else rows[rows.length - 1]!.push(item);
    return rows;
  }, []);

const Spec = ({ label }: SpecProps) => {
  const t = useTheme();

  return (
    <View
      style={{
        paddingHorizontal: t.space[2] + t.space[1] / 2,
        paddingVertical: t.space[1],
        borderRadius: t.radius.pill,
        backgroundColor: t.colors.surfaceSunken,
      }}
    >
      <AppText variant="caption" tabular>
        {label}
      </AppText>
    </View>
  );
};

// A bento tile: plug and live status on top, the type large, then Start, the charge bar, or
// nothing when it is busy. A lone connector lays out sideways across the full width.
const ConnectorTile = ({ charger, connector, wide, onPress }: ConnectorTileProps) => {
  const t = useTheme();
  const startable = canStartCharging(connector.state);
  const type = connector.portType ?? DETAILS_COPY.unknownType;
  const progress = chargingProgress(connector);
  const status = t.colors.status.connector[connector.state];
  const soc = connector.socPercent;

  const statusPill = (
    <View
      style={[
        styles.row,
        styles.shrink,
        {
          gap: t.space[1] + t.space[1] / 2,
          paddingHorizontal: t.space[2],
          paddingVertical: t.space[1] / 2,
          borderRadius: t.radius.pill,
          backgroundColor: withAlpha(status.main, SOFT),
        },
      ]}
    >
      <StatusDot color={status.main} live={connector.state === 'charging'} />
      <AppText variant="caption" numberOfLines={1} style={styles.shrink}>
        {connector.label}
      </AppText>
    </View>
  );

  const plug = (
    <View
      style={[
        styles.center,
        {
          width: t.space[10] + t.space[1],
          height: t.space[10] + t.space[1],
          borderRadius: t.radius.control,
          backgroundColor: withAlpha(status.main, SOFT),
        },
      ]}
    >
      <AppConnectorIcon type={type} size={t.space[6]} available={startable} />
    </View>
  );

  const name = (
    <View>
      <AppText variant="headline" numberOfLines={1}>
        {type}
      </AppText>
      <AppText variant="caption" tone="tertiary" numberOfLines={1}>
        {connectorTitle(connector.connectorId)}
      </AppText>
    </View>
  );

  const start = startable ? (
    <View
      style={[
        styles.row,
        styles.center,
        {
          gap: t.space[1],
          height: t.space[8],
          paddingHorizontal: t.space[3],
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
      <ArrowUpRight color={t.colors.surface} size={t.icon.meta} strokeWidth={t.icon.stroke} />
    </View>
  ) : null;

  const charge = progress ? (
    <View style={{ gap: t.space[1] }}>
      {soc !== null ? (
        <View
          style={[
            styles.track,
            {
              height: t.space[1] + t.space[1] / 2,
              borderRadius: t.radius.pill,
              backgroundColor: withAlpha(status.main, SOFT),
            },
          ]}
        >
          <View
            style={{
              width: `${Math.min(100, Math.max(0, soc))}%`,
              height: '100%',
              borderRadius: t.radius.pill,
              backgroundColor: status.main,
            }}
          />
        </View>
      ) : null}
      <AppText variant="caption" tone="secondary" tabular numberOfLines={1}>
        {progress}
      </AppText>
    </View>
  ) : null;

  return (
    <AppPressable
      onPress={() => onPress(charger, connector)}
      accessibilityRole="button"
      accessibilityLabel={`${connectorTitle(connector.connectorId)}, ${type}, ${connector.label}`}
      accessibilityState={{ disabled: !startable }}
      style={[
        styles.grow,
        {
          gap: t.space[3],
          padding: t.space[3],
          borderRadius: t.radius.card - t.space[1],
          borderWidth: startable ? t.layout.selectedBorder : t.layout.hairline,
          borderColor: startable ? withAlpha(status.main, 0.45) : t.colors.border,
          backgroundColor: t.colors.surface,
        },
      ]}
    >
      {wide ? (
        <>
          <View style={[styles.row, { gap: t.space[3] }]}>
            {plug}
            <View style={[styles.grow, { gap: t.space[1] }]}>
              {name}
              <View style={styles.row}>{statusPill}</View>
            </View>
            {start}
          </View>
          {charge}
        </>
      ) : (
        <>
          <View style={[styles.row, styles.between, { gap: t.space[2] }]}>
            {plug}
            {statusPill}
          </View>
          {name}
          {charge}
          {/* Pinned to the bottom so Start lines up across a row of tiles. */}
          {start ? <View style={[styles.grow, styles.end]}>{start}</View> : null}
        </>
      )}
    </AppPressable>
  );
};

// One charger as a card: a bolt, its name and free count, spec pills, then a grid of its
// connectors, two per row.
const ChargerGroup = ({ charger, index, onConnectorPress }: ChargerGroupProps) => {
  const t = useTheme();
  const free = freeConnectors(charger);
  const total = charger.connectors.length;
  const wide = total === 1;

  const specs = [
    charger.powerType,
    charger.capacityKw !== null ? `${charger.capacityKw} kW` : null,
    charger.pricePerKwhPaise !== null
      ? `${formatRate(charger.pricePerKwhPaise)}${CARD_COPY.price}`
      : null,
  ].filter((spec): spec is string => Boolean(spec));

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
        <View
          style={[
            styles.center,
            {
              width: t.space[8],
              height: t.space[8],
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
        <AppText variant="headline" numberOfLines={1} style={styles.grow}>
          {chargerTitle(index)}
        </AppText>
        {total ? (
          <View
            style={{
              paddingHorizontal: t.space[2] + t.space[1] / 2,
              paddingVertical: t.space[1],
              borderRadius: t.radius.pill,
              backgroundColor: free ? t.colors.successSoft : t.colors.surfaceSunken,
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

      {specs.length ? (
        <View style={[styles.wrap, { gap: t.space[2], paddingHorizontal: t.space[1] }]}>
          {specs.map(spec => (
            <Spec key={spec} label={spec} />
          ))}
        </View>
      ) : null}

      <View style={{ gap: t.space[2] }}>
        {pairs(charger.connectors).map(row => (
          <View key={row[0]!.id} style={[styles.stretch, { gap: t.space[2] }]}>
            {row.map(connector => (
              <ConnectorTile
                key={connector.id}
                charger={charger}
                connector={connector}
                wide={wide}
                onPress={onConnectorPress}
              />
            ))}
            {row.length === 1 && !wide ? <View style={styles.grow} /> : null}
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
  end: {
    justifyContent: 'flex-end',
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
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  track: {
    overflow: 'hidden',
  },
});
