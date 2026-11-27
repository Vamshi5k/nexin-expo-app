import { StyleSheet, View } from 'react-native';

import {
  Headset,
  Info,
  MapPinPlus,
  TicketPercent,
  Wrench,
  type LucideIcon,
} from 'lucide-react-native';

import { AppPressable, AppText } from '@/shared/components';

import { useTheme, withAlpha, type Theme } from '@/shared/theme';

import { KIND_LABEL, NOTIFICATIONS_COPY } from '../constants/notifications.constants';
import type { AppNotification, NotificationKind } from '../types/notifications.types';

type NotificationCardProps = {
  item: AppNotification;
  when: string | null;
  open: boolean;
  onPress: () => void;
};

const SOFT = 0.12;
const LINES = 2;

const KIND_ICON: Record<NotificationKind, LucideIcon> = {
  offers: TicketPercent,
  new_station: MapPinPlus,
  maintenance: Wrench,
  customer_support: Headset,
  information: Info,
};

const kindColor = (t: Theme, kind: NotificationKind) => {
  switch (kind) {
    case 'offers':
      return { fill: t.colors.success, ink: t.colors.successText };
    case 'maintenance':
      return { fill: t.colors.warning, ink: t.colors.warningText };
    case 'information':
      return { fill: t.colors.textTertiary, ink: t.colors.textSecondary };
    default:
      return { fill: t.colors.accent, ink: t.colors.accentText };
  }
};

// One notification: a tile in its category's colour, the category and time, the title (bold
// with a dot while unread) and the message, two lines until it is opened.
const NotificationCard = ({ item, when, open, onPress }: NotificationCardProps) => {
  const t = useTheme();
  const Icon = KIND_ICON[item.kind];
  const color = kindColor(t, item.kind);

  return (
    <AppPressable
      onPress={onPress}
      feedback="opacity"
      accessibilityRole="button"
      accessibilityLabel={[
        item.read ? null : NOTIFICATIONS_COPY.unreadLabel,
        KIND_LABEL[item.kind],
        item.title,
        item.message,
        when,
      ]
        .filter(Boolean)
        .join(', ')}
      accessibilityHint={open ? undefined : NOTIFICATIONS_COPY.expand}
      accessibilityState={{ expanded: open }}
      style={[
        styles.row,
        {
          gap: t.space[3],
          padding: t.space[3],
          borderRadius: t.radius.card,
          borderWidth: t.layout.hairline,
          borderColor: item.read ? t.colors.border : withAlpha(t.colors.accent, 0.4),
          backgroundColor: item.read ? t.colors.surfaceRaised : withAlpha(t.colors.accent, 0.05),
        },
      ]}
    >
      <View
        style={[
          styles.center,
          {
            width: t.space[10],
            height: t.space[10],
            borderRadius: t.radius.control,
            backgroundColor: withAlpha(color.fill, SOFT),
          },
        ]}
      >
        <Icon color={color.ink} size={t.icon.control} strokeWidth={t.icon.stroke} />
      </View>

      <View style={[styles.grow, { gap: t.space[1] / 2 }]}>
        <View style={[styles.line, { gap: t.space[2] }]}>
          <AppText
            variant="caption"
            numberOfLines={1}
            style={[styles.grow, { color: color.ink, fontFamily: t.type.headline.fontFamily }]}
          >
            {KIND_LABEL[item.kind]}
          </AppText>
          {when ? (
            <AppText variant="caption" tone="tertiary" tabular>
              {when}
            </AppText>
          ) : null}
        </View>
        <View style={[styles.line, { gap: t.space[2] }]}>
          <AppText
            variant="subhead"
            numberOfLines={open ? undefined : 1}
            style={[
              styles.grow,
              { fontFamily: item.read ? t.type.subhead.fontFamily : t.type.headline.fontFamily },
            ]}
          >
            {item.title}
          </AppText>
          {item.read ? null : (
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: t.radius.pill,
                backgroundColor: t.colors.accent,
                boxShadow: `0 0 6px 1px ${withAlpha(t.colors.accent, 0.55)}`,
              }}
            />
          )}
        </View>
        {item.message ? (
          <AppText variant="caption" tone="secondary" numberOfLines={open ? undefined : LINES}>
            {item.message}
          </AppText>
        ) : null}
      </View>
    </AppPressable>
  );
};

export default NotificationCard;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  line: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  grow: {
    flex: 1,
  },
});
