import { useEffect, useMemo, useState } from 'react';
import { Keyboard } from 'react-native';

import { zodResolver } from '@hookform/resolvers/zod';
import { router, useNavigation, usePreventRemove } from 'expo-router';
import { useForm, useWatch } from 'react-hook-form';

import { formatContact, useAuth } from '@/features/auth';

import { getErrorMessage, isApiError } from '@/core/api';
import { brand, phonePattern } from '@/core/config';
import { useAction } from '@/core/request';
import { toast } from '@/shared/utils/toast';

import { useContactOtp } from './useContactOtp';
import { profileApi } from '../api/profile.api';
import { EDIT_COPY, EMAIL_OTP_ENABLED, PROFILE_HREF } from '../constants/profile.constants';
import type { ContactKind, EditProfileForm } from '../types/profile.types';
import { changedFields, editProfileSchema, localPhone } from '../utils/form';
import { toFieldErrors } from '../utils/profile';

type LeaveAction = Parameters<
  NonNullable<Parameters<typeof usePreventRemove>[1]>
>[0]['data']['action'];

const PHONE_RULES = { pattern: phonePattern, length: brand.phoneLength };

// Prefilled from the signed-in user. Save stays off until something changed, everything is
// valid and a changed phone (and email, when the API verifies email) has passed OTP. Leaving
// with unsaved edits asks first.
export const useEditProfile = () => {
  const { user, loadUser } = useAuth();
  const navigation = useNavigation();
  const phoneRequired = !!localPhone(user?.phone, brand.phoneLength);
  const schema = useMemo(() => editProfileSchema(PHONE_RULES, { phoneRequired }), [phoneRequired]);
  const save = useAction(profileApi.update);
  const [verified, setVerified] = useState<Record<ContactKind, string | null>>({
    email: null,
    phone: null,
  });
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [pendingLeave, setPendingLeave] = useState<LeaveAction | null>(null);
  const [discarded, setDiscarded] = useState<LeaveAction | null>(null);

  const initial = useMemo<EditProfileForm>(
    () => ({
      firstName: user?.firstName ?? '',
      lastName: user?.lastName ?? '',
      email: user?.email ?? '',
      phone: localPhone(user?.phone, brand.phoneLength),
      gst: user?.gst ?? '',
    }),
    [user],
  );

  const form = useForm<EditProfileForm>({
    resolver: zodResolver(schema),
    defaultValues: initial,
    mode: 'onBlur',
  });
  const watched = useWatch({ control: form.control });
  const values: EditProfileForm = { ...initial, ...watched };
  const changes = changedFields(initial, values);
  const dirty = Object.keys(changes).length > 0;
  const valid = schema.safeParse(values).success;

  const otp = useContactOtp({
    onVerified: (kind, contact) => setVerified(current => ({ ...current, [kind]: contact })),
  });

  // Clearing an optional phone needs no code; a new number does.
  const phoneChanged = !!changes.phone;
  const phoneVerified = !phoneChanged || verified.phone === changes.phone;
  const emailNeedsOtp = EMAIL_OTP_ENABLED && !!changes.email;
  const emailVerified = !emailNeedsOtp || verified.email === changes.email;
  const blocker = !phoneVerified
    ? EDIT_COPY.verifyToSave
    : !emailVerified
      ? EDIT_COPY.verifyEmailToSave
      : null;
  const canSave = dirty && valid && !blocker;

  usePreventRemove(dirty && !saved && !discarded, ({ data }) => setPendingLeave(data.action));

  // The guard has to be off before the leave is replayed, or it would stop it again.
  useEffect(() => {
    if (discarded) navigation.dispatch(discarded);
  }, [discarded, navigation]);

  useEffect(() => {
    if (!saved) return;
    if (router.canGoBack()) router.back();
    else router.replace(PROFILE_HREF.tab);
  }, [saved]);

  const verify = async (kind: ContactKind) => {
    if (!(await form.trigger(kind))) return;

    const raw = form.getValues(kind).trim();
    otp.open(kind, raw);
  };

  const submit = form.handleSubmit(async formValues => {
    if (save.isPending || !canSave) return;

    Keyboard.dismiss();
    setSaveError(null);
    try {
      await save.run(changedFields(initial, formValues));
      await loadUser().catch(() => undefined);
      toast.success(EDIT_COPY.saved);
      setSaved(true);
    } catch (error) {
      const fields = toFieldErrors(isApiError(error) ? error.data : undefined);
      const entries = Object.entries(fields) as [keyof EditProfileForm, string][];
      if (entries.length) {
        entries.forEach(([field, message]) => form.setError(field, { message }));
        return;
      }
      setSaveError(getErrorMessage(error));
    }
  });

  const status = (kind: ContactKind): 'verify' | 'verified' | null => {
    const changed = kind === 'phone' ? phoneChanged : !!changes.email;
    if (changed) {
      if (kind === 'email' && !EMAIL_OTP_ENABLED) return null;
      return verified[kind] === changes[kind] ? 'verified' : 'verify';
    }
    const alreadyVerified = kind === 'phone' ? user?.isPhoneVerified : user?.isEmailVerified;
    return alreadyVerified && values[kind] ? 'verified' : null;
  };

  return {
    control: form.control,
    phonePrefix: brand.phoneCountryCode,
    phoneLength: brand.phoneLength,
    phoneLabel: phoneRequired ? EDIT_COPY.phone : EDIT_COPY.phoneOptional,
    emailStatus: status('email'),
    phoneStatus: status('phone'),
    verifyEmail: () => void verify('email'),
    verifyPhone: () => void verify('phone'),
    otp: {
      ...otp,
      label:
        otp.kind === 'phone'
          ? formatContact('phone', otp.contact, brand.phoneCountryCode)
          : otp.contact,
    },
    canSave,
    blocker,
    saving: save.isPending,
    saveError,
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
