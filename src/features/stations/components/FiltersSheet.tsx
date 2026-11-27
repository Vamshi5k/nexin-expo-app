import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import {
  AppButton,
  AppConnectorIcon,
  AppPressable,
  AppSegmentedControl,
  AppSheet,
  AppText,
  CONNECTOR_TYPES,
  type ConnectorType,
} from '@/shared/components';

import { useTheme } from '@/shared/theme';

import {
  ACCESS_OPTIONS,
  DEFAULT_FILTERS,
  FILTERS_COPY,
  POWER_OPTIONS_KW,
} from '../constants/stations.constants';
import type { StationFilters } from '../types/stations.types';

type FiltersSheetProps = {
  open: boolean;
  filters: StationFilters;
  onApply: (filters: StationFilters) => void;
  onClear: () => void;
  onClose: () => void;
};

const POWER_SEGMENTS = [
  { value: 'any', label: FILTERS_COPY.anyPower },
  ...POWER_OPTIONS_KW.map(kw => ({ value: String(kw), label: `${kw}+ kW` })),
];

const FiltersSheet = ({ open, filters, onApply, onClear, onClose }: FiltersSheetProps) => {
  const t = useTheme();
  const [draft, setDraft] = useState(filters);
  const [wasOpen, setWasOpen] = useState(open);

  // Start from the applied filters every time the sheet opens.
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setDraft(filters);
  }

  const toggleConnector = (type: ConnectorType) => {
    const selected = draft.connectorTypes.includes(type);
    const connectorTypes = selected
      ? draft.connectorTypes.filter(item => item !== type)
      : [...draft.connectorTypes, type];
    setDraft({ ...draft, connectorTypes });
  };

  const onClearPress = () => {
    setDraft(DEFAULT_FILTERS);
    onClear();
  };

  return (
    <AppSheet open={open} onClose={onClose} title={FILTERS_COPY.title}>
      <View style={{ gap: t.space[2] }}>
        <AppText variant="subhead" tone="secondary">
          {FILTERS_COPY.minPower}
        </AppText>
        <AppSegmentedControl
          accessibilityLabel={FILTERS_COPY.minPower}
          segments={POWER_SEGMENTS}
          value={draft.minPowerKw ? String(draft.minPowerKw) : 'any'}
          onChange={value =>
            setDraft({ ...draft, minPowerKw: value === 'any' ? null : Number(value) })
          }
        />
      </View>

      <View style={{ gap: t.space[2] }}>
        <AppText variant="subhead" tone="secondary">
          {FILTERS_COPY.access}
        </AppText>
        <AppSegmentedControl
          accessibilityLabel={FILTERS_COPY.access}
          segments={ACCESS_OPTIONS}
          value={draft.access}
          onChange={access => setDraft({ ...draft, access })}
        />
      </View>

      <View style={{ gap: t.space[2] }}>
        <AppText variant="subhead" tone="secondary">
          {FILTERS_COPY.connectors}
        </AppText>
        <View style={[styles.grid, { gap: t.space[2] }]}>
          {CONNECTOR_TYPES.map(type => {
            const selected = draft.connectorTypes.includes(type);
            return (
              <AppPressable
                key={type}
                onPress={() => toggleConnector(type)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: selected }}
                accessibilityLabel={type}
                style={[
                  styles.connector,
                  {
                    borderRadius: t.radius.control,
                    borderColor: selected ? t.colors.accent : t.colors.border,
                    backgroundColor: selected ? t.colors.accentSoft : t.colors.surface,
                  },
                ]}
              >
                <AppConnectorIcon type={type} size={28} showLabel />
              </AppPressable>
            );
          })}
        </View>
      </View>

      <View style={[styles.actions, { gap: t.space[3] }]}>
        <AppButton
          label={FILTERS_COPY.clear}
          variant="secondary"
          onPress={onClearPress}
          style={styles.grow}
        />
        <AppButton label={FILTERS_COPY.apply} onPress={() => onApply(draft)} style={styles.grow} />
      </View>
    </AppSheet>
  );
};

export default FiltersSheet;

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  connector: {
    width: '23%',
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
  },
  actions: {
    flexDirection: 'row',
  },
  grow: {
    flex: 1,
  },
});
