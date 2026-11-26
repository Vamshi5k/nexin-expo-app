import { fireEvent, screen } from '@testing-library/react-native';
import { router } from 'expo-router';
import { BackHandler } from 'react-native';

import { AppBackButton } from '@/shared/components';

import { renderWithApp } from '../helpers/render';

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), back: jest.fn(), replace: jest.fn(), canGoBack: jest.fn(() => true) },
  useFocusEffect: (effect: () => void | (() => void)) =>
    jest.requireActual('react').useEffect(effect, [effect]),
}));

describe('AppBackButton', () => {
  beforeEach(() => jest.clearAllMocks());

  it('goes back in the router by default', async () => {
    await renderWithApp(<AppBackButton />);
    await fireEvent.press(screen.getByRole('button', { name: 'Back' }));
    expect(router.back).toHaveBeenCalledTimes(1);
  });

  it('with nothing to go back to, replaces with the fallback (root by default)', async () => {
    jest.mocked(router.canGoBack).mockReturnValue(false);

    const root = await renderWithApp(<AppBackButton />);
    await fireEvent.press(screen.getByRole('button', { name: 'Back' }));
    expect(router.replace).toHaveBeenLastCalledWith('/');
    await root.unmount();

    await renderWithApp(<AppBackButton fallbackHref="/(app)/(tabs)/wallet" />);
    await fireEvent.press(screen.getByRole('button', { name: 'Back' }));
    expect(router.replace).toHaveBeenLastCalledWith('/(app)/(tabs)/wallet');
    expect(router.back).not.toHaveBeenCalled();

    jest.mocked(router.canGoBack).mockReturnValue(true);
  });

  it('runs a custom handler instead of the router', async () => {
    const onPress = jest.fn();
    await renderWithApp(<AppBackButton variant="plain" onPress={onPress} />);
    await fireEvent.press(screen.getByRole('button', { name: 'Back' }));
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(router.back).not.toHaveBeenCalled();
  });

  it('claims Android back only with hardwareBack, and lets go on unmount', async () => {
    const remove = jest.fn();
    const spy = jest.spyOn(BackHandler, 'addEventListener').mockReturnValue({ remove });
    const onPress = jest.fn();

    const plain = await renderWithApp(<AppBackButton onPress={onPress} />);
    expect(spy).not.toHaveBeenCalled();
    await plain.unmount();

    const claimed = await renderWithApp(<AppBackButton onPress={onPress} hardwareBack />);
    const [, handler] = spy.mock.calls[0];
    expect(handler({} as Parameters<typeof handler>[0])).toBe(true);
    expect(onPress).toHaveBeenCalledTimes(1);

    await claimed.unmount();
    expect(remove).toHaveBeenCalled();
    spy.mockRestore();
  });
});
