import { fireEvent, screen } from '@testing-library/react-native';
import { router } from 'expo-router';

import { OnboardingScreen } from '@/features/auth';
import { START_HREF } from '@/features/auth/constants';
import { isOnboardingDone } from '@/features/auth/session';

import { renderWithApp } from '../helpers/render';

jest.mock('@/core/log');
jest.mock('expo-router', () => ({
  router: { push: jest.fn(), back: jest.fn(), replace: jest.fn() },
}));

describe('OnboardingScreen', () => {
  it('starts with Next, not Get Started', async () => {
    await renderWithApp(<OnboardingScreen />);

    expect(screen.getByRole('button', { name: 'Next' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Get Started' })).toBeNull();
  });

  it('Skip marks onboarding done and opens Login', async () => {
    await renderWithApp(<OnboardingScreen />);

    await fireEvent.press(screen.getByRole('button', { name: 'Skip' }));

    expect(isOnboardingDone()).toBe(true);
    expect(router.replace).toHaveBeenCalledWith(START_HREF.login);
  });
});
