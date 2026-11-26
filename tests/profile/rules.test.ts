import { ENDPOINTS } from '@/core/endpoints';
import { toProfileStats } from '@/features/profile/api/profile.api';
import type { EditProfileForm } from '@/features/profile/types/profile.types';
import {
  changedFields,
  editProfileSchema,
  GSTIN_PATTERN,
  initialsOf,
  localPhone,
} from '@/features/profile/utils/form';
import { countLabel, deletionPath, toFieldErrors } from '@/features/profile/utils/profile';

const PHONE = { pattern: /^[6-9]\d{9}$/, length: 10 };
const schema = editProfileSchema(PHONE);

const FORM: EditProfileForm = {
  firstName: 'Asha',
  lastName: 'Rao',
  email: 'asha@example.com',
  phone: '9876543210',
  gst: '',
};

const errorsFor = (values: Partial<EditProfileForm>) => {
  const result = schema.safeParse({ ...FORM, ...values });
  return result.success ? {} : result.error.flatten().fieldErrors;
};

describe('edit profile validation', () => {
  it('first name is required and trimmed; last name is optional', () => {
    expect(errorsFor({ firstName: '   ' }).firstName).toEqual(['First name is required']);
    expect(errorsFor({ lastName: '' })).toEqual({});
  });

  it('email is optional, but must be valid when filled', () => {
    expect(errorsFor({ email: '' })).toEqual({});
    expect(errorsFor({ email: ' asha@example.in ' })).toEqual({});
    for (const bad of ['asha', 'asha@', 'asha@example', 'a b@example.com']) {
      expect(errorsFor({ email: bad }).email).toEqual(['Enter a valid email address']);
    }
  });

  it('phone follows the brand rules', () => {
    expect(errorsFor({ phone: '' }).phone).toEqual(['Phone number is required']);
    expect(errorsFor({ phone: '5876543210' }).phone).toEqual([
      'Enter a valid 10-digit mobile number',
    ]);
    expect(errorsFor({ phone: '987654321' }).phone).toBeDefined();
    expect(errorsFor({ phone: '9876543210' })).toEqual({});
  });

  it('an account without a phone may leave it empty, but a filled one must be valid', () => {
    const optional = editProfileSchema(PHONE, { phoneRequired: false });
    expect(optional.safeParse({ ...FORM, phone: '' }).success).toBe(true);
    expect(optional.safeParse({ ...FORM, phone: '12345' }).success).toBe(false);
  });

  it('GSTIN is optional, 15 characters in the GSTIN format, and uppercased', () => {
    expect(errorsFor({ gst: '' })).toEqual({});
    expect(errorsFor({ gst: '22aaaaa0000a1z5' })).toEqual({});
    expect(schema.parse({ ...FORM, gst: ' 22aaaaa0000a1z5 ' }).gst).toBe('22AAAAA0000A1Z5');
    for (const bad of ['22AAAAA0000A1Z', '22AAAAA0000A1X5', 'AAAAAAA0000A1Z5', '22AAAAA0000A0Z5']) {
      expect(GSTIN_PATTERN.test(bad)).toBe(false);
      expect(errorsFor({ gst: bad }).gst).toEqual(['Enter a valid 15-character GSTIN']);
    }
  });
});

describe('changedFields', () => {
  it('sends only what changed, trimmed and in API names', () => {
    expect(changedFields(FORM, FORM)).toEqual({});
    expect(changedFields(FORM, { ...FORM, firstName: ' Asha ' })).toEqual({});
    expect(changedFields(FORM, { ...FORM, firstName: 'Ash', gst: '22aaaaa0000a1z5' })).toEqual({
      first_name: 'Ash',
      gst: '22AAAAA0000A1Z5',
    });
  });

  it('keeps first and last name apart, so a surname is never doubled', () => {
    expect(changedFields(FORM, { ...FORM, lastName: 'Reddy' })).toEqual({ last_name: 'Reddy' });
  });

  it('clearing an optional field sends an empty value', () => {
    expect(changedFields(FORM, { ...FORM, email: '' })).toEqual({ email: '' });
  });
});

describe('profile helpers', () => {
  it('localPhone keeps the last digits of a stored number', () => {
    expect(localPhone('+91 98765 43210', 10)).toBe('9876543210');
    expect(localPhone('919876543210', 10)).toBe('9876543210');
    expect(localPhone(null, 10)).toBe('');
  });

  it('initials from first and last name', () => {
    expect(initialsOf('asha', 'rao')).toBe('AR');
    expect(initialsOf('Asha', '')).toBe('A');
    expect(initialsOf('', '')).toBe('');
  });

  it('counts read friendly: nothing yet, singular, plural, and null stays null', () => {
    expect(countLabel('vehicles', 0)).toBe('No vehicles yet');
    expect(countLabel('vehicles', 1)).toBe('1 vehicle');
    expect(countLabel('vehicles', 2)).toBe('2 vehicles');
    expect(countLabel('sessions', 0)).toBe('No sessions yet');
    expect(countLabel('sessions', 14)).toBe('14 sessions');
    expect(countLabel('favourites', 1)).toBe('1 favourite');
    expect(countLabel('favourites', null)).toBeNull();
  });

  it('toProfileStats reads data.stats and never invents numbers', () => {
    expect(
      toProfileStats({ totalVehicles: 2, totalChargingSessions: '14', totalFavourites: 0 }),
    ).toEqual({ vehicles: 2, sessions: 14, favourites: 0 });
    expect(toProfileStats(null)).toEqual({ vehicles: null, sessions: null, favourites: null });
    expect(toProfileStats({ totalVehicles: 'abc', totalFavourites: -1 })).toEqual({
      vehicles: null,
      sessions: null,
      favourites: null,
    });
  });

  it('profile endpoints', () => {
    expect(ENDPOINTS.PROFILE).toMatchObject({
      GET: '/profile',
      UPDATE: '/profile',
      SEND_OTP: '/profile/send-otp',
      VERIFY_OTP: '/profile/verify-otp',
    });
  });
});

describe('deletionPath', () => {
  const base = { apiEnabled: false, supportUrl: null, supportEmail: null };

  it('uses the in-app API when it is on', () => {
    expect(
      deletionPath({ ...base, apiEnabled: true, deleteAccountUrl: 'https://a.example' }),
    ).toEqual({ kind: 'api' });
  });

  it("opens the brand's own page", () => {
    expect(deletionPath({ ...base, deleteAccountUrl: 'https://volt.example/delete' })).toEqual({
      kind: 'web',
      url: 'https://volt.example/delete',
    });
  });

  it('a brand without a page gets support, never another brand’s page', () => {
    const path = deletionPath({
      ...base,
      deleteAccountUrl: undefined,
      supportUrl: 'https://volt.example/help',
      supportEmail: 'help@volt.example',
    });
    expect(path).toEqual({
      kind: 'support',
      url: 'https://volt.example/help',
      email: 'help@volt.example',
    });
    expect(JSON.stringify(path)).not.toContain('cruzeev');
  });
});

describe('toFieldErrors', () => {
  it('maps an errors object to form fields', () => {
    expect(
      toFieldErrors({ errors: { email: ['Email already in use'], gst: 'Invalid GST' } }),
    ).toEqual({ email: 'Email already in use', gst: 'Invalid GST' });
  });

  it('a message that names exactly one field goes under it', () => {
    expect(toFieldErrors({ message: 'Email already in use' })).toEqual({
      email: 'Email already in use',
    });
    expect(toFieldErrors({ message: 'This phone number is taken' })).toEqual({
      phone: 'This phone number is taken',
    });
  });

  it('anything else returns nothing, so the screen shows a general error', () => {
    expect(toFieldErrors({ message: 'Something went wrong' })).toEqual({});
    expect(toFieldErrors({ message: 'Email or phone already in use' })).toEqual({});
    expect(toFieldErrors(undefined)).toEqual({});
    expect(toFieldErrors('oops')).toEqual({});
  });
});
