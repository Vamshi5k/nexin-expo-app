import { View } from 'react-native';

import { Car, Cpu, Hash } from 'lucide-react-native';

import {
  AppEmptyState,
  AppErrorState,
  AppFormInput,
  AppInput,
  AppSearchBar,
  AppText,
} from '@/shared/components';

import OptionGrid, { type Option } from './OptionGrid';
import OptionGridSkeleton from './OptionGridSkeleton';

import { useTheme } from '@/shared/theme';

import { getErrorMessage } from '@/core/api';
import { brand as appBrand } from '@/core/config';
import type { RequestState } from '@/core/request';

import {
  CUSTOM_CAPACITY_MAX_KWH,
  CUSTOM_CAPACITY_MIN_KWH,
  EMPTY_COPY,
  MAC_ID_MAX_LENGTH,
  REG_NO_MAX_LENGTH,
} from '../constants/vehicles.constants';
import type { VehicleWizard } from '../hooks/useVehicleWizard';
import { formatCapacity, matchesQuery } from '../utils/form';

type VehicleFormBodyProps = {
  wizard: VehicleWizard;
};

const VehicleFormBody = ({ wizard: w }: VehicleFormBodyProps) => {
  const t = useTheme();
  switch (w.step) {
    case 'brand':
      return (
        <Choices
          request={w.brands}
          empty={EMPTY_COPY.brand}
          search={{ placeholder: 'Search brands', query: w.query, onChange: w.setQuery }}
          toOptions={items =>
            items
              .filter(b => matchesQuery(b.name, w.query))
              .map(b => ({
                key: b.id,
                label: b.name,
                monogram: true,
                selected: b.id === w.brand?.id,
              }))
          }
          onSelect={key => {
            const next = w.brands.data?.find(b => b.id === key);
            if (next) w.selectBrand(next);
          }}
        />
      );
    case 'model':
      return (
        <Choices
          request={w.models}
          empty={EMPTY_COPY.model}
          search={{ placeholder: 'Search models', query: w.query, onChange: w.setQuery }}
          toOptions={items =>
            items
              .filter(m => matchesQuery(m.name, w.query))
              .map(m => ({
                key: m.id,
                label: m.name,
                monogram: true,
                selected: m.id === w.model?.id,
              }))
          }
          onSelect={key => {
            const next = w.models.data?.find(m => m.id === key);
            if (next) w.selectModel(next);
          }}
        />
      );
    case 'capacity':
      return (
        <View style={{ gap: t.space[4] }}>
          <Choices
            request={w.capacities}
            empty={EMPTY_COPY.capacity}
            allowEmpty
            toOptions={items => [
              ...items.map(c => ({
                key: c.id,
                label: formatCapacity(c.kwh),
                subtitle: c.rangeKm !== null ? `${c.rangeKm} km range` : undefined,
                selected:
                  !w.customMode && w.capacity?.kind === 'preset' && w.capacity.capacity.id === c.id,
              })),
              {
                key: CUSTOM_KEY,
                label: 'Custom',
                subtitle: 'Enter manually',
                selected: w.customMode,
              },
            ]}
            onSelect={key => {
              if (key === CUSTOM_KEY) return w.chooseCustom();
              const next = w.capacities.data?.find(c => c.id === key);
              if (next) w.selectCapacity({ kind: 'preset', capacity: next });
            }}
          />
          {w.customMode ? (
            <AppInput
              label="Battery capacity (kWh)"
              placeholder="e.g. 40"
              hint={`Between ${CUSTOM_CAPACITY_MIN_KWH} and ${CUSTOM_CAPACITY_MAX_KWH} kWh`}
              keyboardType="decimal-pad"
              value={w.customText}
              onChangeText={w.setCustomText}
              error={w.customError}
              autoFocus
            />
          ) : null}
        </View>
      );
    case 'details':
      return (
        <View style={{ gap: t.space[4] }}>
          <AppFormInput
            control={w.control}
            name="regNo"
            label="Registration Number *"
            placeholder={appBrand.regNoPlaceholder}
            icon={Hash}
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={REG_NO_MAX_LENGTH}
          />
          <AppText variant="caption" tone="tertiary" style={{ letterSpacing: 0.6 }}>
            FOR AUTO CHARGE
          </AppText>
          <AppFormInput
            control={w.control}
            name="macId"
            label="MAC ID"
            placeholder="AA:BB:CC:DD:EE:FF"
            icon={Cpu}
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={MAC_ID_MAX_LENGTH}
          />
          <AppFormInput
            control={w.control}
            name="maxAmount"
            label={`Max Charging Amount (${appBrand.currency.symbol})`}
            placeholder="e.g. 500"
            keyboardType="number-pad"
          />
        </View>
      );
  }
};

const CUSTOM_KEY = '__custom__';

// Lists longer than this get a search field.
const SEARCH_AFTER = 6;

type ChoicesProps<T> = {
  request: RequestState<T[]>;
  empty: string;
  allowEmpty?: boolean;
  search?: { placeholder: string; query: string; onChange: (q: string) => void };
  toOptions: (items: T[]) => Option[];
  onSelect: (key: string) => void;
};

const Choices = <T,>({
  request,
  empty,
  allowEmpty,
  search,
  toOptions,
  onSelect,
}: ChoicesProps<T>) => {
  const t = useTheme();
  if (request.loading) return <OptionGridSkeleton />;
  if (request.error) {
    return (
      <AppErrorState
        message={getErrorMessage(request.error)}
        onRetry={() => void request.refetch()}
      />
    );
  }
  const items = request.data ?? [];
  // Capacity keeps its grid when empty: "Custom" is still a valid choice.
  if (items.length === 0 && !allowEmpty) {
    return (
      <AppEmptyState
        icon={Car}
        title={empty}
        actionLabel="Retry"
        onAction={() => void request.refetch()}
      />
    );
  }
  const options = toOptions(items);

  return (
    <View style={{ gap: t.space[3] }}>
      {search && items.length > SEARCH_AFTER ? (
        <AppSearchBar
          placeholder={search.placeholder}
          value={search.query}
          onChangeText={search.onChange}
        />
      ) : null}
      {options.length > 0 ? (
        <OptionGrid options={options} onSelect={onSelect} />
      ) : (
        <AppText variant="callout" tone="secondary" align="center">
          No matches
        </AppText>
      )}
    </View>
  );
};

export default VehicleFormBody;
