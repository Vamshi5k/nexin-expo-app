import { fireEvent, screen } from '@testing-library/react-native';
import { router } from 'expo-router';

import { ProfileSetupScreen } from '@/features/setup';
import { updateProfile } from '@/features/setup/api';
import { toast } from '@/ui/toast';

import { renderWithApp } from '../helpers/render';

jest.mock('@/core/log');
jest.mock('expo-router', () => ({
  router: { push: jest.fn(), back: jest.fn(), replace: jest.fn() },
}));
jest.mock('@/features/setup/api', () => ({ updateProfile: jest.fn(async () => undefined) }));

describe('ProfileSetupScreen', () => {
  it('needs the terms ticked, then saves the name and moves to the vehicle step', async () => {
    await renderWithApp(<ProfileSetupScreen />);
    const continueButton = screen.getByRole('button', { name: 'Continue' });

    await fireEvent.changeText(screen.getByLabelText('Full Name'), '  Asha Rao ');
    expect(continueButton).toBeDisabled();

    await fireEvent.press(
      screen.getByRole('checkbox', { name: 'I accept the Terms & Conditions and Privacy Policy' }),
    );
    expect(continueButton).toBeEnabled();
    await fireEvent.press(continueButton);

    expect(updateProfile).toHaveBeenCalledWith('Asha Rao');
    expect(toast.success).toHaveBeenCalledWith('Profile updated successfully');
    expect(router.replace).toHaveBeenCalledWith('/(setup)/vehicle');
  });
});
