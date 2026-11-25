import { Keyboard } from 'react-native';

import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useForm, useWatch } from 'react-hook-form';

import { useClientConfig } from '@/features/client-config';
import { fleetApi } from '@/features/fleet';

import { getErrorMessage } from '@/core/api';
import { useAction } from '@/core/request';
import { toast } from '@/shared/utils/toast';

import { FLEET_HREF, FLEET_LOGIN_COPY } from '../constants/auth.constants';
import type { FleetLoginForm } from '../types/auth.types';
import { fleetLoginFormSchema } from '../utils/contact';
import { openLegal } from '../utils/legal';

export const useFleetLoginForm = () => {
  const config = useClientConfig();
  const login = useAction(fleetApi.login);

  const form = useForm<FleetLoginForm>({
    resolver: zodResolver(fleetLoginFormSchema),
    defaultValues: { fleetId: '', contact: '' },
    mode: 'onTouched',
  });
  const values = useWatch({ control: form.control });
  const valid = fleetLoginFormSchema.safeParse(values).success;

  const submit = form.handleSubmit(async ({ fleetId, contact }) => {
    if (login.isPending) return;

    Keyboard.dismiss();
    try {
      const driverId = await login.run(fleetId, contact);
      toast.success(FLEET_LOGIN_COPY.sent);
      router.push({ pathname: FLEET_HREF.otp, params: { fleetId, contact, driverId } });
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  });

  return {
    control: form.control,
    valid,
    submitting: login.isPending,
    submit: () => void submit(),
    openTerms: () => void openLegal(config.links.terms),
    openPrivacy: () => void openLegal(config.links.privacy),
  };
};
