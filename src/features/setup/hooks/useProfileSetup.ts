import { useState } from 'react';
import { Keyboard } from 'react-native';

import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useForm, useWatch } from 'react-hook-form';

import { openLegal, useAuth } from '@/features/auth';
import { useClientConfig } from '@/features/client-config';

import { getErrorMessage } from '@/core/api';
import { useAction } from '@/core/request';
import { toast } from '@/shared/utils/toast';

import { setupApi } from '../api/setup.api';
import { SETUP_HREF } from '../constants/setup.constants';
import { initialsOf, profileFormSchema, type ProfileForm } from '../utils/profile';

export const useProfileSetup = () => {
  const { user, loadUser } = useAuth();
  const config = useClientConfig();
  const [accepted, setAccepted] = useState(false);
  const save = useAction(setupApi.updateProfile);

  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: { name: user?.firstName ?? '' },
    mode: 'onTouched',
  });
  const name = useWatch({ control: form.control, name: 'name' });
  const valid = profileFormSchema.safeParse({ name }).success && accepted;

  const submit = form.handleSubmit(async values => {
    if (save.isPending) return;

    if (!accepted) {
      toast.error('Please accept the Terms & Conditions and Privacy Policy to continue');
      return;
    }
    Keyboard.dismiss();
    try {
      await save.run(values.name.trim());
      toast.success('Profile updated successfully');
      // Picks up the saved name and, if the server cleared it, isFirstLogin.
      void loadUser().catch(() => undefined);
      router.replace(SETUP_HREF.vehicle);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  });

  return {
    control: form.control,
    initials: initialsOf(name ?? ''),
    accepted,
    toggleAccepted: () => setAccepted(a => !a),
    valid,
    saving: save.isPending,
    submit: () => void submit(),
    openTerms: () => void openLegal(config.termsUrl),
    openPrivacy: () => void openLegal(config.privacyUrl),
  };
};
