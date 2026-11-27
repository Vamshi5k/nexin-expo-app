import { useCallback, useState } from 'react';
import { Keyboard } from 'react-native';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';

import { getErrorMessage } from '@/core/api';
import { useAction, useRequest } from '@/core/request';
import { toast } from '@/shared/utils/toast';

import { vehiclesApi } from '../api/vehicles.api';
import { PICK_STEPS, STEP_COPY, WIZARD_STEPS } from '../constants/vehicles.constants';
import type {
  Brand,
  CapacityChoice,
  Model,
  VehicleDetails,
  VehiclePick,
  WizardStep,
} from '../types/vehicles.types';
import { customCapacitySchema, detailsSchema, formatCapacity } from '../utils/form';

const NO_ITEMS = () => Promise.resolve([]);

// Brand -> model -> capacity -> details, shared by Vehicle Setup and Add Vehicle. With
// `onPicked` it stops after the battery and hands the picks back (Edit Vehicle's "Change").
type UseVehicleWizardOptions = {
  onAdded?: () => void;
  onPicked?: (pick: VehiclePick) => void;
};

export const useVehicleWizard = ({ onAdded, onPicked }: UseVehicleWizardOptions) => {
  const steps = onPicked ? PICK_STEPS : WIZARD_STEPS;
  const [stepIndex, setStepIndex] = useState(0);
  const [brand, setBrand] = useState<Brand | null>(null);
  const [model, setModel] = useState<Model | null>(null);
  const [preset, setPreset] = useState<CapacityChoice | null>(null);
  // "Custom" shows an inline kWh field; the choice only counts once the value is valid.
  const [customMode, setCustomMode] = useState(false);
  const [customText, setCustomText] = useState('');
  const [query, setQuery] = useState('');
  const step: WizardStep = steps[stepIndex] ?? 'brand';

  const brandId = brand?.id;
  const modelId = model?.id;
  const brands = useRequest(vehiclesApi.getBrands);
  const loadModels = useCallback(
    () => (brandId ? vehiclesApi.getModels(brandId) : NO_ITEMS()),
    [brandId],
  );
  const models = useRequest(loadModels, { enabled: !!brandId });
  const loadCapacities = useCallback(
    () => (modelId ? vehiclesApi.getCapacities(modelId) : NO_ITEMS()),
    [modelId],
  );
  const capacities = useRequest(loadCapacities, { enabled: !!modelId });

  const form = useForm<VehicleDetails>({
    resolver: zodResolver(detailsSchema),
    defaultValues: { regNo: '', macId: '', maxAmount: '' },
    mode: 'onTouched',
  });
  const details = useWatch({ control: form.control });
  const detailsValid = detailsSchema.safeParse(details).success;

  const customParsed = customCapacitySchema.safeParse(customText);
  const capacity: CapacityChoice | null = customMode
    ? customParsed.success
      ? { kind: 'custom', kwh: customParsed.data }
      : null
    : preset;
  const customError =
    customMode && customText.trim() !== '' && !customParsed.success
      ? (customParsed.error.issues[0]?.message ?? 'Invalid capacity')
      : undefined;

  const add = useAction(vehiclesApi.addVehicle);

  const submit = form.handleSubmit(async values => {
    if (!model || !capacity || add.isPending) return;

    Keyboard.dismiss();
    try {
      await add.run({ model, capacity, details: values });
      toast.success('Vehicle added successfully!');
      onAdded?.();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  });

  const canContinue =
    step === 'brand'
      ? !!brand
      : step === 'model'
        ? !!model
        : step === 'capacity'
          ? !!capacity
          : detailsValid;

  const copy = STEP_COPY[step];

  const goToStep = (index: number) => {
    setQuery('');
    setStepIndex(index);
  };

  // Picks made on earlier steps, shown as chips that jump back to their step.
  const trail = [
    brand && { index: 0, label: brand.name },
    model && { index: 1, label: model.name },
    capacity && {
      index: 2,
      label: formatCapacity(capacity.kind === 'preset' ? capacity.capacity.kwh : capacity.kwh),
    },
  ].filter((item): item is { index: number; label: string } => !!item && item.index < stepIndex);

  return {
    step,
    stepIndex,
    stepCount: steps.length,
    title: copy.title,
    subtitle: copy.subtitle.replace('{brand}', brand?.name ?? ''),
    brands,
    models,
    capacities,
    brand,
    model,
    capacity,
    selectBrand: (next: Brand) => {
      if (next.id !== brand?.id) {
        setModel(null);
        setPreset(null);
        setCustomMode(false);
      }
      setBrand(next);
    },
    selectModel: (next: Model) => {
      if (next.id !== model?.id) {
        setPreset(null);
        setCustomMode(false);
      }
      setModel(next);
    },
    selectCapacity: (next: CapacityChoice) => {
      setPreset(next);
      setCustomMode(false);
    },
    customMode,
    chooseCustom: () => setCustomMode(true),
    customText,
    setCustomText,
    customError,
    trail,
    goTo: (index: number) => {
      if (index < stepIndex) goToStep(index);
    },
    query,
    setQuery,
    control: form.control,
    canContinue,
    submitting: add.isPending,
    isLastStep: stepIndex === steps.length - 1,
    next: () => {
      if (stepIndex < steps.length - 1) {
        goToStep(stepIndex + 1);
        return;
      }
      if (!onPicked) {
        void submit();
        return;
      }
      if (model && capacity) onPicked({ brand, model, capacity });
    },
    // Returns false on the first step, so the screen decides what "back" means there.
    back: (): boolean => {
      if (stepIndex === 0) return false;
      goToStep(stepIndex - 1);
      return true;
    },
  };
};

export type VehicleWizard = ReturnType<typeof useVehicleWizard>;
