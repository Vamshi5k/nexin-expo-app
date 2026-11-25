import type { WizardStep } from '../types/vehicles.types';

export const WIZARD_STEPS: WizardStep[] = ['brand', 'model', 'capacity', 'details'];

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
  details: { title: 'Vehicle details', subtitle: 'A few more details to complete your profile' },
};

export const EMPTY_COPY: Record<Exclude<WizardStep, 'details'>, string> = {
  brand: 'No brands available',
  model: 'No models for this brand',
  capacity: 'No battery options for this model',
};
