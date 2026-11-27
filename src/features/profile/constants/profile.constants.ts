export const PROFILE_HREF = {
  edit: '/(app)/profile/edit',
  vehicles: '/(app)/vehicles',
  history: '/(app)/charging/history',
  favourites: '/(app)/favorites',
  notifications: '/(app)/notifications',
  tab: '/(app)/(tabs)/profile',
} as const;

export const PROFILE_OTP_LENGTH = 4;
export const PROFILE_OTP_RESEND_SECONDS = 30;

// TODO(backend): flip once DELETE /profile and its OTP re-check are confirmed (OPEN_QUESTIONS #19).
export const DELETE_ACCOUNT_API_ENABLED = false;

// TODO(backend): set from a dev-backend test of /profile/send-otp with an email (OPEN_QUESTIONS #20).
// Off: email changes save without OTP.
export const EMAIL_OTP_ENABLED = false;

export const PROFILE_COPY = {
  title: 'Account',
  userId: (id: string) => `ID ${id}`,
  newUser: 'New user',
  noEmail: 'No email provided',
  notifications: 'Notifications',
  editProfile: 'Edit profile',
  account: 'Account',
  vehicles: 'My Vehicles',
  history: 'Charging History',
  favourites: 'Favourite Spots',
  support: 'Support',
  help: 'Help & Support',
  helpBody: 'FAQs, chat and tickets',
  logout: 'Log out',
  loggingOut: 'Logging out…',
  deleteAccount: 'Delete Account',
  loadError: "Couldn't load your account details",
  retry: 'Retry',
  version: (brandName: string, version: string, build: string | null) =>
    build ? `${brandName} v${version} (${build})` : `${brandName} v${version}`,
  developer: 'Developer',
  uiKit: 'UI kit',
  cookieCheck: 'Cookie check',
} as const;

export const COMING_SOON_COPY = {
  body: 'This screen is on its way. Check back after the next update.',
  vehicles: 'My Vehicles',
  history: 'Charging History',
  favourites: 'Favourite Spots',
  notifications: 'Notifications',
} as const;

export const COUNT_COPY = {
  vehicles: { none: 'No vehicles yet', one: '1 vehicle', many: (n: number) => `${n} vehicles` },
  sessions: { none: 'No sessions yet', one: '1 session', many: (n: number) => `${n} sessions` },
  favourites: {
    none: 'No favourites yet',
    one: '1 favourite',
    many: (n: number) => `${n} favourites`,
  },
} as const;

export const DELETE_COPY = {
  title: 'Delete your account?',
  web: 'This opens the page where you can request deletion. Your account, wallet balance and history will be removed.',
  support:
    'Contact support to delete your account. Your account, wallet balance and history will be removed.',
  continue: 'Continue',
  contactSupport: 'Contact support',
  cancel: 'Cancel',
  unavailable: 'Account deletion is not available right now. Please contact support.',
  supportSubject: 'Delete my account',
} as const;

export const EDIT_COPY = {
  title: 'Edit Profile',
  subtitle: 'Keep your details up to date',
  personal: 'Personal details',
  contact: 'Contact',
  business: 'Business',
  firstName: 'First name',
  firstNamePlaceholder: 'Enter your first name',
  lastName: 'Last name (optional)',
  lastNamePlaceholder: 'Enter your last name',
  email: 'Email (optional)',
  emailPlaceholder: 'Enter your email address',
  phone: 'Phone',
  phoneOptional: 'Phone (optional)',
  phonePlaceholder: 'Enter mobile number',
  gst: 'GSTIN (optional)',
  gstPlaceholder: 'E.g. 22AAAAA0000A1Z5',
  verify: 'Verify',
  verified: 'Verified',
  save: 'Save Changes',
  retry: 'Retry',
  verifyToSave: 'Verify your new phone number to save',
  verifyEmailToSave: 'Verify your new email to save',
  saved: 'Profile updated successfully',
  firstNameRequired: 'First name is required',
  emailInvalid: 'Enter a valid email address',
  phoneRequired: 'Phone number is required',
  phoneInvalid: (length: number) => `Enter a valid ${length}-digit mobile number`,
  gstInvalid: 'Enter a valid 15-character GSTIN',
  discardTitle: 'Discard changes?',
  discardBody: "Your edits haven't been saved.",
  discard: 'Discard',
  keepEditing: 'Keep editing',
} as const;

export const OTP_COPY = {
  title: (kind: 'email' | 'phone') => (kind === 'email' ? 'Verify email' : 'Verify phone'),
  body: (contact: string) => `Enter the 4-digit code sent to ${contact}`,
  sent: 'OTP sent successfully',
  verified: 'Verified successfully',
  wrong: 'Wrong or expired code. Try again or resend.',
  resend: 'Resend code',
  resendIn: (seconds: number) => `Resend in ${seconds}s`,
  verify: 'Verify',
} as const;
