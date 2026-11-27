import { toNotification } from '@/features/notifications/api/notifications.api';
import { NOTIFICATIONS_COPY } from '@/features/notifications/constants/notifications.constants';
import type { AppNotification } from '@/features/notifications/types/notifications.types';
import {
  countByFilter,
  dayKey,
  filterNotifications,
  formatWhen,
  groupByDay,
  toKind,
} from '@/features/notifications/utils/notifications';

const NOW = new Date(2026, 10, 27, 15, 0);
const at = (days: number, hours = 0, minutes = 0) =>
  new Date(2026, 10, 27 - days, 15 - hours, -minutes).toISOString();

const note = (id: string, kind: AppNotification['kind'], createdAt: string | null) => ({
  id,
  kind,
  title: id,
  message: '',
  createdAt,
  read: false,
});

describe('toKind', () => {
  it.each([
    ['Offers', 'offers'],
    ['New Station', 'new_station'],
    ['new_station', 'new_station'],
    ['MAINTENANCE', 'maintenance'],
    ['Customer Support', 'customer_support'],
    ['customer-support', 'customer_support'],
    ['Information', 'information'],
    ['promo', 'information'],
    [null, 'information'],
  ])('%s -> %s', (type, kind) => {
    expect(toKind(type)).toBe(kind);
  });
});

describe('toNotification', () => {
  it('maps the DTO and never leaves the title blank', () => {
    expect(
      toNotification({
        id: 7,
        type: 'Offers',
        title: '  ',
        message: ' 20% off ',
        createdAt: '2026-11-27T09:00:00.000Z',
        isRead: true,
      } as never),
    ).toEqual({
      id: '7',
      kind: 'offers',
      title: 'Offers',
      message: '20% off',
      createdAt: '2026-11-27T09:00:00.000Z',
      read: true,
    });
  });

  it('treats a missing read flag and date as unread with no time', () => {
    const item = toNotification({ id: 'a', type: 'x', title: 'Hi' } as never);
    expect(item.read).toBe(false);
    expect(item.createdAt).toBeNull();
    expect(item.kind).toBe('information');
  });
});

describe('filters', () => {
  const items = [
    note('1', 'offers', null),
    note('2', 'maintenance', null),
    note('3', 'offers', null),
  ];

  it('filters by category and counts each one', () => {
    expect(filterNotifications(items, 'all')).toHaveLength(3);
    expect(filterNotifications(items, 'offers').map(i => i.id)).toEqual(['1', '3']);
    expect(countByFilter(items, 'maintenance')).toBe(1);
    expect(countByFilter(items, 'new_station')).toBe(0);
  });
});

describe('days', () => {
  it('labels today, yesterday and earlier', () => {
    expect(dayKey(at(0, 2), NOW)).toBe('today');
    expect(dayKey(at(1), NOW)).toBe('yesterday');
    expect(dayKey(at(4), NOW)).toBe('earlier');
    expect(dayKey(null, NOW)).toBe('none');
    expect(dayKey('nope', NOW)).toBe('none');
  });

  it('groups in list order, one group per earlier date', () => {
    const groups = groupByDay(
      [
        note('a', 'offers', at(0, 1)),
        note('b', 'offers', at(0, 3)),
        note('c', 'offers', at(1)),
        note('d', 'offers', at(3)),
        note('e', 'offers', at(5)),
      ],
      NOW,
    );
    expect(groups.map(g => [g.day, g.items.map(i => i.id).join('')])).toEqual([
      ['today', 'ab'],
      ['yesterday', 'c'],
      ['earlier', 'd'],
      ['earlier', 'e'],
    ]);
  });
});

describe('formatWhen', () => {
  const when = (iso: string | null) => formatWhen(iso, NOW, 'en-IN', NOTIFICATIONS_COPY);

  it('is relative today and a time otherwise', () => {
    expect(when(at(0, 0, 0))).toBe('Just now');
    expect(when(at(0, 0, 5))).toBe('5 min ago');
    expect(when(at(0, 3))).toBe('3 h ago');
    expect(when(at(2))).toMatch(/3[:.]00/);
    expect(when(null)).toBeNull();
  });
});
