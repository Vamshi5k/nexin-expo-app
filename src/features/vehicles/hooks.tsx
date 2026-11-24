import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { Keyboard } from 'react-native';

import { getErrorMessage } from '@/core/api';
import { useAction, useRequest } from '@/core/request';
import { toast } from '@/ui';

import { addVehicle, getBrands, getCapacities, getModels } from './api';
import { STEP_COPY, WIZARD_STEPS } from './constants';
import { customCapacitySchema, detailsSchema } from './form';
import type { Brand, CapacityChoice, Model, VehicleDetails, WizardStep } from './types';

const NO_ITEMS = () => Promise.resolve([]);

// Brand -> model -> capacity -> details. Shared by Vehicle Setup and, later, Add / Edit Vehicle.
export function useVehicleWizard({ onAdded }: { onAdded: () => void }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [brand, setBrand] = useState<Brand | null>(null);
  const [model, setModel] = useState<Model | null>(null);
  const [preset, setPreset] = useState<CapacityChoice | null>(null);
  // "Custom" shows an inline kWh field; the choice only counts once the value is valid.
  const [customMode, setCustomMode] = useState(false);
  const [customText, setCustomText] = useState('');
  const step: WizardStep = WIZARD_STEPS[stepIndex];

  const brandId = brand?.id;
  const modelId = model?.id;
  const brands = useRequest(getBrands);
  const loadModels = useCallback(() => (brandId ? getModels(brandId) : NO_ITEMS()), [brandId]);
  const models = useRequest(loadModels, { enabled: !!brandId });
  const loadCapacities = useCallback(
    () => (modelId ? getCapacities(modelId) : NO_ITEMS()),
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

  const add = useAction(addVehicle);

  const submit = form.handleSubmit(async (values) => {
    if (!model || !capacity) return;
    Keyboard.dismiss();
    try {
      await add.run({ model, capacity, details: values });
      toast.success('Vehicle added successfully!');
      onAdded();
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

  return {
    step,
    stepIndex,
    stepCount: WIZARD_STEPS.length,
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
    control: form.control,
    canContinue,
    submitting: add.isPending,
    isLastStep: stepIndex === WIZARD_STEPS.length - 1,
    next: () => {
      if (stepIndex < WIZARD_STEPS.length - 1) setStepIndex((i) => i + 1);
      else void submit();
    },
    // Returns false on the first step, so the screen decides what "back" means there.
    back: (): boolean => {
      if (stepIndex === 0) return false;
      setStepIndex((i) => i - 1);
      return true;
    },
  };
}

export type VehicleWizard = ReturnType<typeof useVehicleWizard>;
