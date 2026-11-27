import { useCallback, useEffect, useRef, useState } from 'react';
import { Keyboard } from 'react-native';

import { zodResolver } from '@hookform/resolvers/zod';
import { router, useNavigation, usePreventRemove } from 'expo-router';
import { useForm, useWatch } from 'react-hook-form';

import { getErrorMessage } from '@/core/api';
import { useAction, useRequest } from '@/core/request';
import { toast } from '@/shared/utils/toast';

import { vehiclesApi } from '../api/vehicles.api';
import { EDIT_VEHICLE_COPY, VEHICLES_COPY, VEHICLES_HREF } from '../constants/vehicles.constants';
import type { VehicleDetails, VehiclePick } from '../types/vehicles.types';
import { detailsSchema, formatCapacity } from '../utils/form';
import { editDraft, sameCapacity, sameDetails, vehicleTitle } from '../utils/vehicles';

type LeaveAction = Parameters<
  NonNullable<Parameters<typeof usePreventRemove>[1]>
>[0]['data']['action'];

const EMPTY_DETAILS: VehicleDetails = { regNo: '', macId: '', maxAmount: '' };

const leave = () => {
  if (router.canGoBack()) router.back();
  else router.replace(VEHICLES_HREF.list);
};

// Loads the vehicle by id (from the list: there is no single-vehicle endpoint), shows it as a
// form, and swaps brand / model / battery through the wizard's picks. Save stays off until
// something changed; leaving with edits asks first.
export const useEditVehicle = (vehicleId: string) => {
  const navigation = useNavigation();
  const request = useRequest(vehiclesApi.getVehicles);
  const save = useAction(vehiclesApi.updateVehicle);
  const [pick, setPick] = useState<VehiclePick | null>(null);
  const [picking, setPicking] = useState(false);
  const [saved, setSaved] = useState(false);
  const [pendingLeave, setPendingLeave] = useState<LeaveAction | null>(null);
  const [discarded, setDiscarded] = useState<LeaveAction | null>(null);
  const prefilled = useRef(false);

  const vehicle = request.data?.find(item => item.id === vehicleId) ?? null;
  const draft = vehicle ? editDraft(vehicle) : null;

  const form = useForm<VehicleDetails>({
    resolver: zodResolver(detailsSchema),
    defaultValues: EMPTY_DETAILS,
    mode: 'onBlur',
  });

  useEffect(() => {
    if (!draft || prefilled.current) return;
    prefilled.current = true;
    form.reset(draft.details);
  }, [draft, form]);

  const watched = useWatch({ control: form.control });
  const details: VehicleDetails = { ...EMPTY_DETAILS, ...watched };
  const model = pick?.model ?? draft?.model ?? null;
  const capacity = pick?.capacity ?? draft?.capacity ?? null;
  const brandName = pick ? (pick.brand?.name ?? '') : (vehicle?.brandName ?? '');

  const pickChanged =
    !!pick &&
    (pick.model.id !== draft?.model?.id || !sameCapacity(pick.capacity, draft?.capacity ?? null));
  const dirty = !!draft && (pickChanged || !sameDetails(draft.details, details));
  const valid = detailsSchema.safeParse(details).success && !!model && !!capacity;

  usePreventRemove(dirty && !saved && !discarded, ({ data }) => setPendingLeave(data.action));

  useEffect(() => {
    if (discarded) navigation.dispatch(discarded);
  }, [discarded, navigation]);

  useEffect(() => {
    if (saved) leave();
  }, [saved]);

  const submit = form.handleSubmit(async values => {
    if (save.isPending || !dirty || !model || !capacity) return;

    Keyboard.dismiss();
    try {
      await save.run(vehicleId, { model, capacity, details: values });
      toast.success(EDIT_VEHICLE_COPY.saved);
      setSaved(true);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  });

  const onPicked = useCallback((next: VehiclePick) => {
    setPick(next);
    setPicking(false);
  }, []);

  const kwh = capacity ? (capacity.kind === 'preset' ? capacity.capacity.kwh : capacity.kwh) : null;

  return {
    loading: !request.data && request.loading,
    failed: !request.data && !request.loading && !!request.error,
    errorMessage: getErrorMessage(request.error),
    notFound: !!request.data && !vehicle,
    retry: () => void request.refetch(),
    backToList: () => router.replace(VEHICLES_HREF.list),
    control: form.control,
    title: vehicleTitle({ brandName, modelName: model?.name ?? '' }, VEHICLES_COPY.unknownModel),
    battery: kwh !== null ? formatCapacity(kwh) : EDIT_VEHICLE_COPY.pickBattery,
    picking,
    startPicking: () => setPicking(true),
    cancelPicking: () => setPicking(false),
    onPicked,
    canSave: dirty && valid,
    saving: save.isPending,
    submit: () => void submit(),
    leaveOpen: pendingLeave !== null,
    keepEditing: () => setPendingLeave(null),
    discard: () => {
      if (!pendingLeave) return;
      setDiscarded(pendingLeave);
      setPendingLeave(null);
    },
  };
};
