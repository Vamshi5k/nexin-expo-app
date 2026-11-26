import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ChevronDown } from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { AppPressable, AppText } from '@/shared/components';

import StatusDot from './StatusDot';

import { useTheme, type Theme } from '@/shared/theme';

import { chargerName, DETAILS_COPY, shortConnector } from '../constants/stations.constants';
import type { Charger, Connector } from '../types/stations.types';
import { chargerSpecs } from '../utils/connector';

type IdleChargersProps = {
  chargers: { charger: Charger; index: number }[];
  onConnectorPress: (charger: Charger, connector: Connector) => void;
};

const DOWN_STATES = ['unavailable', 'faulted', 'offline'];

const statusInk = (t: Theme, connector: Connector) =>
  DOWN_STATES.includes(connector.state) ? t.colors.dangerText : t.colors.textSecondary;

// Chargers with nothing free or charging, one quiet row each in a single card. A row opens to
// show its connectors.
const IdleChargers = ({ chargers, onConnectorPress }: IdleChargersProps) => {
  const t = useTheme();
  const [open, setOpen] = useState<string[]>([]);

  const toggle = (id: string) =>
    setOpen(current =>
      current.includes(id) ? current.filter(item => item !== id) : [...current, id],
    );

  return (
    <View
      style={{
        paddingHorizontal: t.space[4],
        borderRadius: t.radius.sheet,
        borderWidth: t.layout.hairline,
        borderColor: t.colors.border,
        backgroundColor: t.colors.surfaceRaised,
      }}
    >
      {chargers.map(({ charger, index }, position) => {
        const first = charger.connectors[0];
        const expanded = open.includes(charger.id);
        const status = first ? t.colors.status.connector[first.state] : null;

        return (
          <View
            key={charger.id}
            style={{
              borderTopWidth: position ? t.layout.hairline : 0,
              borderTopColor: t.colors.border,
            }}
          >
            <AppPressable
              onPress={() => toggle(charger.id)}
              feedback="opacity"
              accessibilityRole="button"
              accessibilityState={{ expanded }}
              accessibilityLabel={`${chargerName(index)}, ${first?.label ?? ''}`}
              style={[styles.row, { gap: t.space[3], paddingVertical: t.space[4] }]}
            >
              <View style={styles.grow}>
                <AppText variant="headline" numberOfLines={1}>
                  {chargerName(index)}
                </AppText>
                <AppText variant="subhead" tone="secondary" tabular numberOfLines={1}>
                  {chargerSpecs(charger, 'connectors')}
                </AppText>
              </View>
              {first && status ? (
                <View style={[styles.row, styles.shrink, { gap: t.space[2] }]}>
                  <StatusDot color={status.main} />
                  <AppText
                    variant="subhead"
                    numberOfLines={1}
                    style={[
                      styles.shrink,
                      { fontFamily: t.type.headline.fontFamily, color: statusInk(t, first) },
                    ]}
                  >
                    {first.label}
                  </AppText>
                </View>
              ) : null}
              <View style={expanded ? styles.flip : undefined}>
                <ChevronDown
                  color={t.colors.textTertiary}
                  size={t.icon.meta}
                  strokeWidth={t.icon.stroke}
                />
              </View>
            </AppPressable>

            {expanded ? (
              <Animated.View
                entering={FadeIn.duration(t.motion.duration)}
                style={{ gap: t.space[2], paddingBottom: t.space[4] }}
              >
                {charger.connectors.map(connector => (
                  <AppPressable
                    key={connector.id}
                    onPress={() => onConnectorPress(charger, connector)}
                    feedback="opacity"
                    accessibilityRole="button"
                    accessibilityLabel={`${shortConnector(connector.connectorId)}, ${connector.portType ?? DETAILS_COPY.unknownType}, ${connector.label}`}
                    style={[
                      styles.row,
                      {
                        gap: t.space[3],
                        paddingHorizontal: t.space[3],
                        paddingVertical: t.space[2] + t.space[1] / 2,
                        borderRadius: t.radius.control,
                        backgroundColor: t.colors.surfaceSunken,
                      },
                    ]}
                  >
                    <AppText variant="subhead" tone="secondary" tabular>
                      {shortConnector(connector.connectorId)}
                    </AppText>
                    <AppText
                      variant="subhead"
                      style={[styles.grow, { fontFamily: t.type.headline.fontFamily }]}
                    >
                      {connector.portType ?? DETAILS_COPY.unknownType}
                    </AppText>
                    <StatusDot color={t.colors.status.connector[connector.state].main} />
                    <AppText
                      variant="caption"
                      numberOfLines={1}
                      style={[styles.shrink, { color: statusInk(t, connector) }]}
                    >
                      {connector.label}
                    </AppText>
                  </AppPressable>
                ))}
              </Animated.View>
            ) : null}
          </View>
        );
      })}
    </View>
  );
};

export default IdleChargers;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  grow: {
    flex: 1,
  },
  shrink: {
    flexShrink: 1,
  },
  flip: {
    transform: [{ rotate: '180deg' }],
  },
});
