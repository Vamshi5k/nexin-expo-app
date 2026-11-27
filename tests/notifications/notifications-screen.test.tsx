import { act, fireEvent, screen } from '@testing-library/react-native';

import { apiError } from '@/core/api';
import { NotificationsScreen } from '@/features/notifications';
import { notificationsApi } from '@/features/notifications/api/notifications.api';
import type { AppNotification } from '@/features/notifications/types/notifications.types';

import { renderWithApp } from '../helpers/render';

jest.mock('@/core/log');
jest.mock('expo-router', () => ({
  router: { push: jest.fn(), back: jest.fn(), replace: jest.fn(), canGoBack: jest.fn(() => true) },
  useFocusEffect: (effect: () => void | (() => void)) =>
    jest.requireActual('react').useEffect(effect, [effect]),
}));
jest.mock('@/features/notifications/api/notifications.api', () => ({
  ...jest.requireActual('@/features/notifications/api/notifications.api'),
  notificationsApi: { getPage: jest.fn() },
}));

const api = jest.mocked(notificationsApi);
const today = new Date();

const item = (id: string, kind: AppNotification['kind'], read = false): AppNotification => ({
  id,
  kind,
  title: `Title ${id}`,
  message: `Message ${id}`,
  createdAt: today.toISOString(),
  read,
});

const page = (items: AppNotification[], current = 1, totalPages = 1) => ({
  items,
  page: current,
  totalPages,
  total: items.length,
});

beforeEach(() => {
  jest.clearAllMocks();
  api.getPage.mockResolvedValue(
    page([item('1', 'offers'), item('2', 'maintenance'), item('3', 'new_station', true)]),
  );
});

describe('Notifications', () => {
  it('lists by day with unread count, and the pills filter with counts', async () => {
    await renderWithApp(<NotificationsScreen />);

    expect(await screen.findByText('Title 1')).toBeTruthy();
    expect(screen.getByText('2 unread')).toBeTruthy();
    expect(screen.getByText('Today')).toBeTruthy();
    expect(screen.getAllByRole('tab').map(tab => tab.props.accessibilityLabel)).toEqual([
      'All',
      'Offers',
      'New Station',
      'Maintenance',
      'Customer Support',
      'Information',
    ]);

    await fireEvent.press(screen.getByRole('tab', { name: 'Maintenance' }));
    expect(screen.queryByText('Title 1')).toBeNull();
    expect(screen.getByText('Title 2')).toBeTruthy();
  });

  it('opening one marks it read', async () => {
    await renderWithApp(<NotificationsScreen />);
    await fireEvent.press(await screen.findByLabelText(/^Unread, Offers, Title 1/));
    expect(screen.getByText('1 unread')).toBeTruthy();
    expect(screen.getByLabelText(/^Offers, Title 1/)).toHaveProp('accessibilityState', {
      expanded: true,
    });
  });

  it('an empty category offers Show all', async () => {
    await renderWithApp(<NotificationsScreen />);
    await screen.findByText('Title 1');
    await fireEvent.press(screen.getByRole('tab', { name: 'Customer Support' }));
    expect(screen.getByText('No customer support notifications')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Show all' }));
    expect(screen.getByText('Title 1')).toBeTruthy();
  });

  it('empty and error states', async () => {
    api.getPage.mockResolvedValueOnce(page([]));
    const empty = await renderWithApp(<NotificationsScreen />);
    expect(await screen.findByText('No Notifications')).toBeTruthy();
    expect(screen.getByText("You're all caught up")).toBeTruthy();
    await empty.unmount();

    api.getPage.mockRejectedValueOnce(apiError('down', 'network'));
    await renderWithApp(<NotificationsScreen />);
    expect(await screen.findByText("Couldn't load notifications")).toBeTruthy();
    await act(async () => fireEvent.press(screen.getByRole('button', { name: 'Retry' })));
    expect(await screen.findByText('Title 1')).toBeTruthy();
  });

  it('a category with nothing loaded keeps fetching pages', async () => {
    api.getPage
      .mockResolvedValueOnce(page([item('1', 'offers')], 1, 3))
      .mockResolvedValueOnce(page([item('2', 'offers')], 2, 3))
      .mockResolvedValueOnce(page([item('3', 'customer_support')], 3, 3));
    await renderWithApp(<NotificationsScreen />);
    await screen.findByText('Title 1');

    await fireEvent.press(screen.getByRole('tab', { name: 'Customer Support' }));
    expect(await screen.findByText('Title 3')).toBeTruthy();
    expect(api.getPage).toHaveBeenCalledTimes(3);
  });

  it('loads the next page near the bottom', async () => {
    api.getPage
      .mockResolvedValueOnce(page([item('1', 'offers')], 1, 2))
      .mockResolvedValueOnce(page([item('9', 'information')], 2, 2));
    await renderWithApp(<NotificationsScreen />);
    await screen.findByText('Title 1');

    await act(async () =>
      fireEvent.scroll(screen.getByTestId('notifications-scroll'), {
        nativeEvent: {
          contentOffset: { y: 0 },
          contentSize: { height: 500 },
          layoutMeasurement: { height: 800 },
        },
      }),
    );
    expect(api.getPage).toHaveBeenLastCalledWith(2);
    expect(await screen.findByText('Title 9')).toBeTruthy();
  });
});
