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
  const [capacity, setCapacity] = useState<CapacityChoice | null>(null);
  const [customOpen, setCustomOpen] = useState(false);
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
        setCapacity(null);
      }
      setBrand(next);
    },
    selectModel: (next: Model) => {
      if (next.id !== model?.id) setCapacity(null);
      setModel(next);
    },
    selectCapacity: (next: CapacityChoice) => setCapacity(next),
    customOpen,
    openCustom: () => setCustomOpen(true),
    closeCustom: () => setCustomOpen(false),
    saveCustom: (raw: string): string | null => {
      const parsed = customCapacitySchema.safeParse(raw);
      if (!parsed.success) return parsed.error.issues[0]?.message ?? 'Invalid capacity';
      setCapacity({ kind: 'custom', kwh: parsed.data });
      setCustomOpen(false);
      return null;
    },
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
