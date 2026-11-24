import { Car, Cpu, Hash } from 'lucide-react-native';
import { useState } from 'react';
import { View } from 'react-native';

import { getErrorMessage } from '@/core/api';
import { brand as appBrand } from '@/core/config';
import type { RequestState } from '@/core/request';
import { useTheme } from '@/theme';
import { Button, EmptyState, ErrorState, FormInput, Input, Sheet, Text } from '@/ui';

import {
  CUSTOM_CAPACITY_MAX_KWH,
  CUSTOM_CAPACITY_MIN_KWH,
  EMPTY_COPY,
  MAC_ID_MAX_LENGTH,
  REG_NO_MAX_LENGTH,
} from '../constants';
import { formatCapacity } from '../form';
import type { VehicleWizard } from '../hooks';

import { OptionGrid, OptionGridSkeleton, type Option } from './OptionGrid';

// Title, step progress and the current step's body. The screen owns the header and footer.
export function VehicleForm({ wizard }: { wizard: VehicleWizard }) {
  const t = useTheme();
  return (
    <View style={{ gap: t.space[6] }}>
      <View style={{ gap: t.space[3] }}>
        <StepBars index={wizard.stepIndex} count={wizard.stepCount} />
        <View style={{ gap: t.space[1] }}>
          <Text variant="title1" accessibilityRole="header">
            {wizard.title}
          </Text>
          <Text variant="callout" tone="secondary">
            {wizard.subtitle}
          </Text>
        </View>
      </View>
      <StepBody wizard={wizard} />
      <CustomCapacitySheet wizard={wizard} />
    </View>
  );
}

function StepBody({ wizard: w }: { wizard: VehicleWizard }) {
  const t = useTheme();
  switch (w.step) {
    case 'brand':
      return (
        <Choices
          request={w.brands}
          empty={EMPTY_COPY.brand}
          toOptions={(items) =>
            items.map((b) => ({ key: b.id, label: b.name, selected: b.id === w.brand?.id }))
          }
          onSelect={(key) => {
            const next = w.brands.data?.find((b) => b.id === key);
            if (next) w.selectBrand(next);
          }}
        />
      );
    case 'model':
      return (
        <Choices
          request={w.models}
          empty={EMPTY_COPY.model}
          toOptions={(items) =>
            items.map((m) => ({ key: m.id, label: m.name, selected: m.id === w.model?.id }))
          }
          onSelect={(key) => {
            const next = w.models.data?.find((m) => m.id === key);
            if (next) w.selectModel(next);
          }}
        />
      );
    case 'capacity': {
      const custom = w.capacity?.kind === 'custom' ? w.capacity.kwh : null;
      return (
        <Choices
          request={w.capacities}
          empty={EMPTY_COPY.capacity}
          allowEmpty
          toOptions={(items) => [
            ...items.map((c) => ({
              key: c.id,
              label: formatCapacity(c.kwh),
              subtitle: c.rangeKm !== null ? `${c.rangeKm} km range` : undefined,
              selected: w.capacity?.kind === 'preset' && w.capacity.capacity.id === c.id,
            })),
            {
              key: CUSTOM_KEY,
              label: custom !== null ? formatCapacity(custom) : 'Custom',
              subtitle: 'Enter manually',
              selected: custom !== null,
            },
          ]}
          onSelect={(key) => {
            if (key === CUSTOM_KEY) return w.openCustom();
            const next = w.capacities.data?.find((c) => c.id === key);
            if (next) w.selectCapacity({ kind: 'preset', capacity: next });
          }}
        />
      );
    }
    case 'details':
      return (
        <View style={{ gap: t.space[5] }}>
          <FormInput
            control={w.control}
            name="regNo"
            label="Registration Number *"
            placeholder={appBrand.regNoPlaceholder}
            icon={Hash}
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={REG_NO_MAX_LENGTH}
          />
          <Text variant="caption" tone="tertiary" style={{ letterSpacing: 0.6 }}>
            FOR AUTO CHARGE
          </Text>
          <FormInput
            control={w.control}
            name="macId"
            label="MAC ID"
            placeholder="AA:BB:CC:DD:EE:FF"
            icon={Cpu}
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={MAC_ID_MAX_LENGTH}
          />
          <FormInput
            control={w.control}
            name="maxAmount"
            label={`Max Charging Amount (${appBrand.currency.symbol})`}
            placeholder="e.g. 500"
            keyboardType="number-pad"
          />
        </View>
      );
  }
}

const CUSTOM_KEY = '__custom__';

function Choices<T>({
  request,
  empty,
  allowEmpty,
  toOptions,
  onSelect,
}: {
  request: RequestState<T[]>;
  empty: string;
  allowEmpty?: boolean;
  toOptions: (items: T[]) => Option[];
  onSelect: (key: string) => void;
}) {
  if (request.loading) return <OptionGridSkeleton />;
  if (request.error) {
    return (
      <ErrorState message={getErrorMessage(request.error)} onRetry={() => void request.refetch()} />
    );
  }
  const items = request.data ?? [];
  // Capacity keeps its grid when empty: "Custom" is still a valid choice.
  if (items.length === 0 && !allowEmpty) {
    return (
      <EmptyState
        icon={Car}
        title={empty}
        actionLabel="Retry"
        onAction={() => void request.refetch()}
      />
    );
  }
  return <OptionGrid options={toOptions(items)} onSelect={onSelect} />;
}

function StepBars({ index, count }: { index: number; count: number }) {
  const t = useTheme();
  return (
    <View
      style={{ flexDirection: 'row', gap: t.space[1] }}
      accessible
      accessibilityLabel={`Vehicle step ${index + 1} of ${count}`}
    >
      {Array.from({ length: count }, (_, i) => (
        <View
          key={i}
          style={{
            flex: 1,
            height: 3,
            borderRadius: t.radius.pill,
            backgroundColor: i <= index ? t.colors.accent : t.colors.border,
          }}
        />
      ))}
    </View>
  );
}

function CustomCapacitySheet({ wizard: w }: { wizard: VehicleWizard }) {
  const t = useTheme();
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  return (
    <Sheet
      open={w.customOpen}
      onClose={() => {
        setError(null);
        w.closeCustom();
      }}
      title="Custom"
      description={`Enter your battery capacity (${CUSTOM_CAPACITY_MIN_KWH}–${CUSTOM_CAPACITY_MAX_KWH} kWh)`}
    >
      <View style={{ gap: t.space[4] }}>
        <Input
          label="Battery capacity (kWh)"
          placeholder="e.g. 40"
          keyboardType="decimal-pad"
          value={value}
          onChangeText={(next) => {
            setValue(next);
            setError(null);
          }}
          error={error ?? undefined}
        />
        <Button label="Save" onPress={() => setError(w.saveCustom(value))} />
      </View>
    </Sheet>
  );
}
