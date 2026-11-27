import type { NotificationFilter, NotificationKind } from '../types/notifications.types';

export const NOTIFICATIONS_HREF = {
  profile: '/(app)/(tabs)/profile',
} as const;

export const NOTIFICATION_FILTERS: NotificationFilter[] = [
  'all',
  'offers',
  'new_station',
  'maintenance',
  'customer_support',
  'information',
];

export const KIND_LABEL: Record<NotificationKind, string> = {
  offers: 'Offers',
  new_station: 'New Station',
  maintenance: 'Maintenance',
  customer_support: 'Customer Support',
  information: 'Information',
};

export const NOTIFICATIONS_COPY = {
  title: 'Notifications',
  unread: (n: number) => (n === 1 ? '1 unread' : `${n} unread`),
  caughtUp: "You're all caught up",
  all: 'All',
  filtersLabel: 'Filter notifications',
  today: 'Today',
  yesterday: 'Yesterday',
  justNow: 'Just now',
  minutesAgo: (n: number) => `${n} min ago`,
  hoursAgo: (n: number) => `${n} h ago`,
  unreadLabel: 'Unread',
  fallbackTitle: 'Notification',
  emptyTitle: 'No Notifications',
  emptyBody: "You're all caught up! New notifications will appear here.",
  emptyFiltered: (label: string) => `No ${label.toLowerCase()} notifications`,
  emptyFilteredBody: 'Try another category.',
  showAll: 'Show all',
  loadError: "Couldn't load notifications",
  loadMoreError: "Couldn't load more notifications",
  retry: 'Retry',
  expand: 'Shows the full message',
} as const;
