import type { WizardStep } from '../types/vehicles.types';

export const WIZARD_STEPS: WizardStep[] = ['brand', 'model', 'capacity', 'details'];
// Edit's "Change": only the picks, the details stay on the edit form.
export const PICK_STEPS: WizardStep[] = ['brand', 'model', 'capacity'];

export const REG_NO_MIN_LENGTH = 6;
export const REG_NO_MAX_LENGTH = 15;
export const MAC_ID_MIN_LENGTH = 6;
// "AA:BB:CC:DD:EE:FF" is 17 characters; the old app capped the input at 12 (screen-audit 2.6).
export const MAC_ID_MAX_LENGTH = 17;
export const CUSTOM_CAPACITY_MIN_KWH = 10;
export const CUSTOM_CAPACITY_MAX_KWH = 500;

export const STEP_COPY: Record<WizardStep, { title: string; subtitle: string }> = {
  brand: { title: 'Select your brand', subtitle: 'Choose your electric vehicle manufacturer' },
  model: { title: 'Select your model', subtitle: 'Pick your {brand} model' },
  capacity: { title: 'Battery capacity', subtitle: 'Helps us estimate charging time accurately' },
  details: {
    title: 'Vehicle details',
    subtitle: 'Your registration number, plus auto-charge details if you use it',
  },
};

export const EMPTY_COPY: Record<Exclude<WizardStep, 'details'>, string> = {
  brand: 'No brands available',
  model: 'No models for this brand',
  capacity: 'No battery options for this model',
};

export const VEHICLES_HREF = {
  list: '/(app)/vehicles',
  add: '/(app)/vehicles/add',
  profile: '/(app)/(tabs)/profile',
} as const;

export const VEHICLES_COPY = {
  title: 'My Vehicles',
  count: (n: number) => (n === 1 ? '1 vehicle' : `${n} vehicles`),
  empty: 'Add your vehicles to manage charging',
  primary: 'Primary',
  autoCharge: 'Auto-charge',
  autoChargeOn: 'Auto-charge on',
  autoChargeOff: 'Auto-charge off',
  needsMac: 'Add a MAC ID to use auto-charge',
  autoChargeEnabled: 'Auto-charge turned on',
  autoChargeDisabled: 'Auto-charge turned off',
  range: (km: number) => `${km} km range`,
  actions: (title: string) => `More actions for ${title}`,
  edit: 'Edit vehicle',
  makePrimary: 'Make primary',
  delete: 'Delete vehicle',
  madePrimary: (title: string) => `${title} is now your primary vehicle`,
  deleteTitle: 'Remove this vehicle?',
  deleteBody: (title: string, regNo: string) =>
    `${title} (${regNo}) will be removed from your account.`,
  deletePrimary: 'It is your primary vehicle, so no vehicle will be primary until you pick one.',
  deleteOnly: 'It is your only vehicle.',
  remove: 'Remove',
  cancel: 'Cancel',
  removed: 'Vehicle removed',
  add: 'Add Vehicle',
  emptyTitle: 'No vehicles yet',
  emptyBody: 'Add your EV to start managing your charging sessions.',
  loadError: "Couldn't load vehicles",
  retry: 'Retry',
  unknownModel: 'Vehicle',
} as const;

export const ADD_COPY = {
  title: 'Add Vehicle',
  step: (index: number, count: number) => `Step ${index + 1} of ${count}`,
  continue: 'Continue',
  add: 'Add Vehicle',
} as const;

export const EDIT_VEHICLE_COPY = {
  title: 'Edit Vehicle',
  subtitle: 'Change any detail and save',
  vehicle: 'Vehicle',
  battery: 'Battery',
  change: 'Change',
  details: 'Details',
  autoCharge: 'For auto-charge (optional)',
  regNo: 'Registration number',
  regNoPlaceholder: 'E.g. KA01AB1234',
  macId: 'MAC ID',
  macIdPlaceholder: 'AA:BB:CC:DD:EE:FF',
  maxAmount: 'Max amount per session',
  maxAmountPlaceholder: 'E.g. 500',
  save: 'Save Changes',
  saved: 'Vehicle updated successfully',
  usePick: 'Use this vehicle',
  pickBattery: 'Pick a battery to continue',
  notFound: "Couldn't find this vehicle",
  notFoundBody: 'It may have been removed. Go back to your vehicles.',
  backToList: 'Back to My Vehicles',
  discardTitle: 'Discard changes?',
  discardBody: "Your edits haven't been saved.",
  discard: 'Discard',
  keepEditing: 'Keep editing',
} as const;
