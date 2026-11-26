import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';

import Animated from 'react-native-reanimated';

import { AppConnectorIcon, AppPressable, AppText } from '@/shared/components';

import CardGradient from './CardGradient';
import StatusDot from './StatusDot';

import { useTheme } from '@/shared/theme';

import { formatRate } from '@/shared/utils/money';
import { slideIn } from '@/shared/utils/motion';

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
  chargerIndex: number;
  connector: Connector;
  width: number;
  onPress: (charger: Charger, connector: Connector) => void;
};

// Connectors always sit in a sideways row; the next card peeks so the swipe is obvious.
const SWIPE_CARD_RATIO = 0.72;

const chargerMeta = (charger: Charger, index: number) =>
  [
    chargerTitle(index),
    charger.powerType,
    charger.capacityKw !== null ? `${charger.capacityKw} kW` : null,
  ]
    .filter(Boolean)
    .join(' · ');

// A connector in the map card's language: its own status gradient, white pills, one clear tap.
const ConnectorCard = ({
  charger,
  chargerIndex,
  connector,
  width,
  onPress,
}: ConnectorCardProps) => {
  const t = useTheme();
  const startable = canStartCharging(connector.state);
  const { label } = connector;
  const type = connector.portType ?? DETAILS_COPY.unknownType;
  const progress = chargingProgress(connector);
  const status = t.colors.status.connector[connector.state];

  const pill = {
    gap: t.space[2],
    paddingHorizontal: t.space[3],
    paddingVertical: t.space[1],
    borderRadius: t.radius.pill,
    backgroundColor: t.colors.surface,
  };

  return (
    <AppPressable
      onPress={() => onPress(charger, connector)}
      accessibilityRole="button"
      accessibilityLabel={`${connectorTitle(connector.connectorId)}, ${type}, ${label}`}
      accessibilityState={{ disabled: !startable }}
      style={[
        styles.card,
        {
          width,
          gap: t.space[3],
          padding: t.space[3],
          borderRadius: t.radius.card,
          borderWidth: t.layout.hairline,
          borderColor: t.colors.border,
          backgroundColor: t.colors.surfaceRaised,
        },
      ]}
    >
      <CardGradient color={status.tint} id={`connector-${charger.id}-${connector.id}`} />

      <View style={[styles.row, { gap: t.space[3] }]}>
        <View
          style={[
            styles.center,
            {
              width: t.space[10],
              height: t.space[10],
              borderRadius: t.radius.control,
              backgroundColor: t.colors.surface,
            },
          ]}
        >
          <AppConnectorIcon type={type} size={t.space[6]} available={startable} />
        </View>
        <View style={styles.grow}>
          <AppText
            variant="subhead"
            numberOfLines={1}
            style={{ fontFamily: t.type.headline.fontFamily }}
          >
            {type}
          </AppText>
          <AppText variant="caption" tone="secondary" numberOfLines={1}>
            {chargerMeta(charger, chargerIndex)}
          </AppText>
        </View>
        <View style={[styles.row, pill]}>
          <AppText variant="caption" tabular>
            {`C${connector.connectorId}`}
          </AppText>
        </View>
      </View>

      {progress ? (
        <AppText variant="subhead" tabular style={{ fontFamily: t.type.headline.fontFamily }}>
          {progress}
        </AppText>
      ) : null}

      <View style={[styles.row, styles.between, { gap: t.space[2] }]}>
        {charger.pricePerKwhPaise !== null ? (
          <AppText variant="subhead" tabular style={{ fontFamily: t.type.headline.fontFamily }}>
            {`${formatRate(charger.pricePerKwhPaise)} ${CARD_COPY.price}`}
          </AppText>
        ) : (
          <View />
        )}
        <View style={[styles.row, pill, styles.shrink]}>
          <StatusDot color={status.main} live={connector.state === 'charging'} />
          <AppText variant="caption" numberOfLines={1} style={styles.shrink}>
            {label}
          </AppText>
        </View>
      </View>
    </AppPressable>
  );
};

// One charger: its header, then its connectors in a sideways row (one connector fills the width).
const ChargerGroup = ({ charger, index, onConnectorPress }: ChargerGroupProps) => {
  const t = useTheme();
  const { width: screenWidth } = useWindowDimensions();
  const free = freeConnectors(charger);
  const total = charger.connectors.length;
  const swipe = total > 1;
  const fullWidth = screenWidth - t.layout.screenPadding * 2;
  const cardWidth = swipe ? Math.round(screenWidth * SWIPE_CARD_RATIO) : fullWidth;

  const cards = charger.connectors.map((connector, position) => (
    <Animated.View key={connector.id} entering={slideIn(position + 4)}>
      <ConnectorCard
        charger={charger}
        chargerIndex={index}
        connector={connector}
        width={cardWidth}
        onPress={onConnectorPress}
      />
    </Animated.View>
  ));

  return (
    <View style={{ gap: t.space[3] }}>
      <View style={[styles.row, styles.between, { paddingHorizontal: t.layout.screenPadding }]}>
        <AppText
          variant="subhead"
          numberOfLines={1}
          style={[styles.shrink, { fontFamily: t.type.headline.fontFamily }]}
        >
          {chargerMeta(charger, index)}
        </AppText>
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

      <ScrollView
        horizontal
        scrollEnabled={swipe}
        showsHorizontalScrollIndicator={false}
        snapToInterval={cardWidth + t.space[3]}
        decelerationRate="fast"
        contentContainerStyle={{ gap: t.space[3], paddingHorizontal: t.layout.screenPadding }}
      >
        {cards}
      </ScrollView>
    </View>
  );
};

export default ChargerGroup;

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  between: {
    justifyContent: 'space-between',
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
});
