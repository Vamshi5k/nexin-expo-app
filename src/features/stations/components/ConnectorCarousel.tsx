import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';

import { AppConnectorIcon, AppPressable, AppText } from '@/shared/components';

import CardGradient from './CardGradient';

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

type ConnectorCarouselProps = {
  chargers: Charger[];
  onConnectorPress: (charger: Charger, connector: Connector) => void;
};

type ConnectorCardProps = {
  charger: Charger;
  chargerIndex: number;
  connector: Connector;
  width: number;
  onPress: (charger: Charger, connector: Connector) => void;
};

const CARD_WIDTH_RATIO = 0.62;

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
  const label = CONNECTOR_LABEL[connector.state];
  const type = connector.portType ?? DETAILS_COPY.unknownType;
  const progress = chargingProgress(connector);
  const color = t.colors.connector[connectorColorKey(connector.state)];

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
          gap: t.space[4],
          padding: t.space[4],
          borderRadius: t.radius.card,
          borderWidth: t.layout.hairline,
          borderColor: t.colors.border,
          backgroundColor: t.colors.surfaceRaised,
        },
      ]}
    >
      <CardGradient color={color} id={`connector-${charger.id}-${connector.id}`} />

      <View style={[styles.row, styles.between]}>
        <View
          style={[
            styles.center,
            {
              width: t.space[12],
              height: t.space[12],
              borderRadius: t.radius.control,
              backgroundColor: t.colors.surface,
            },
          ]}
        >
          <AppConnectorIcon type={type} size={t.space[8]} available={startable} />
        </View>
        <View style={[styles.row, pill]}>
          <AppText variant="caption" tabular>
            {`C${connector.connectorId}`}
          </AppText>
        </View>
      </View>

      <View style={{ gap: t.space[1] / 2 }}>
        <AppText variant="headline" numberOfLines={1}>
          {type}
        </AppText>
        <AppText variant="caption" tone="secondary" numberOfLines={1}>
          {chargerMeta(charger, chargerIndex)}
        </AppText>
      </View>

      <View style={[styles.row, styles.between, { gap: t.space[2] }]}>
        {charger.pricePerKwhPaise !== null ? (
          <AppText variant="subhead" tabular style={{ fontFamily: t.type.headline.fontFamily }}>
            {`${formatRate(charger.pricePerKwhPaise)} ${CARD_COPY.price}`}
          </AppText>
        ) : (
          <View />
        )}
        <View style={[styles.row, pill, styles.shrink]}>
          <View
            style={{
              width: t.space[2],
              height: t.space[2],
              borderRadius: t.radius.pill,
              backgroundColor: color,
            }}
          />
          <AppText variant="caption" numberOfLines={1} style={styles.shrink}>
            {progress ?? label}
          </AppText>
        </View>
      </View>
    </AppPressable>
  );
};

// Every connector of the station in one swipeable row, like the map's card carousel.
const ConnectorCarousel = ({ chargers, onConnectorPress }: ConnectorCarouselProps) => {
  const t = useTheme();
  const { width: screenWidth } = useWindowDimensions();
  const cardWidth = Math.round(screenWidth * CARD_WIDTH_RATIO);

  const free = chargers.reduce((sum, charger) => sum + freeConnectors(charger), 0);
  const total = chargers.reduce((sum, charger) => sum + charger.connectors.length, 0);

  return (
    <View style={{ gap: t.space[3] }}>
      <View style={[styles.row, styles.between, { paddingHorizontal: t.layout.screenPadding }]}>
        <AppText variant="title2" accessibilityRole="header">
          {DETAILS_COPY.connectors}
        </AppText>
        <AppText
          variant="subhead"
          tabular
          style={{ color: free ? t.colors.successText : t.colors.textTertiary }}
        >
          {freeBadge(free, total)}
        </AppText>
      </View>
      <AppText
        variant="subhead"
        tone="secondary"
        style={{ paddingHorizontal: t.layout.screenPadding }}
      >
        {DETAILS_COPY.tip}
      </AppText>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={cardWidth + t.space[3]}
        decelerationRate="fast"
        contentContainerStyle={{ gap: t.space[3], paddingHorizontal: t.layout.screenPadding }}
      >
        {chargers.flatMap((charger, chargerIndex) =>
          charger.connectors.map(connector => (
            <ConnectorCard
              key={`${charger.id}-${connector.id}`}
              charger={charger}
              chargerIndex={chargerIndex}
              connector={connector}
              width={cardWidth}
              onPress={onConnectorPress}
            />
          )),
        )}
      </ScrollView>
    </View>
  );
};

export default ConnectorCarousel;

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
});
