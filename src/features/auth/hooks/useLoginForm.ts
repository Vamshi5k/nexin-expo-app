import { useState } from 'react';
import { Keyboard } from 'react-native';

import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useForm, useWatch } from 'react-hook-form';

import { useClientConfig } from '@/features/client-config';

import { getErrorMessage } from '@/core/api';
import { useAction } from '@/core/request';
import { toast } from '@/shared/utils/toast';

import { useAuth } from './useAuth';
import { FLEET_HREF, LOGIN_COPY } from '../constants/auth.constants';
import type { ContactForm, ContactType } from '../types/auth.types';
import { contactFormSchema } from '../utils/contact';
import { openLegal } from '../utils/legal';

export const useLoginForm = () => {
  const config = useClientConfig();
  const [override, setOverride] = useState<ContactType | null>(null);
  const type: ContactType = config.loginType === 'email' ? 'email' : (override ?? 'phone');
  const request = useAction(useAuth().requestOtp);

  const form = useForm<ContactForm>({
    resolver: zodResolver(contactFormSchema[type]),
    defaultValues: { contact: '' },
    mode: 'onTouched',
  });
  const contact = useWatch({ control: form.control, name: 'contact' });
  const valid = contactFormSchema[type].safeParse({ contact }).success;

  const switchType = () => {
    form.reset({ contact: '' });
    setOverride(type === 'phone' ? 'email' : 'phone');
  };

  const submit = form.handleSubmit(async ({ contact: raw }) => {
    if (request.isPending) return;

    const value = raw.trim();
    Keyboard.dismiss();
    try {
      await request.run(value);
      router.push({ pathname: '/(auth)/otp', params: { type, value } });
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  });

  return {
    type,
    copy: LOGIN_COPY[type],
    control: form.control,
    valid,
    submitting: request.isPending,
    submit: () => void submit(),
    canSwitchType: config.loginType === 'phone',
    switchType,
    showFleetLogin: config.features.fleet,
    openFleetLogin: () => router.push(FLEET_HREF.login),
    openTerms: () => void openLegal(config.termsUrl),
    openPrivacy: () => void openLegal(config.privacyUrl),
  };
};
