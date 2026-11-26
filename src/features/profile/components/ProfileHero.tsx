import { StyleSheet, View } from 'react-native';

import { Pencil } from 'lucide-react-native';

import { AppPressable, AppText } from '@/shared/components';

import { useTheme } from '@/shared/theme';

import { PROFILE_COPY } from '../constants/profile.constants';

type ProfileHeroProps = {
  name: string;
  initials: string;
  email: string | null;
  phone: string | null;
  onEdit: () => void;
};

// The account card: initials, name, email (or a quiet "No email provided") and phone, with the
// edit button. Plain white, sitting on the screen's brand wash.
const ProfileHero = ({ name, initials, email, phone, onEdit }: ProfileHeroProps) => {
  const t = useTheme();
  const avatar = t.space[12] + t.space[2];

  return (
    <View
      style={[
        styles.card,
        styles.row,
        {
          gap: t.space[3],
          padding: t.space[4],
          borderRadius: t.radius.sheet,
          borderWidth: t.layout.hairline,
          borderColor: t.colors.border,
          backgroundColor: t.colors.surfaceRaised,
        },
      ]}
    >
      <View
        style={[
          styles.center,
          {
            width: avatar,
            height: avatar,
            borderRadius: t.radius.pill,
            backgroundColor: t.colors.accentSoft,
          },
        ]}
      >
        <AppText variant="title3" tone="accent">
          {initials || '·'}
        </AppText>
      </View>

      <View style={[styles.grow, { gap: t.space[1] / 2 }]}>
        <AppText variant="headline" numberOfLines={1}>
          {name}
        </AppText>
        <AppText variant="caption" tone={email ? 'secondary' : 'tertiary'} numberOfLines={1}>
          {email ?? PROFILE_COPY.noEmail}
        </AppText>
        {phone ? (
          <AppText variant="caption" tone="secondary" tabular numberOfLines={1}>
            {phone}
          </AppText>
        ) : null}
      </View>

      <AppPressable
        onPress={onEdit}
        haptic="light"
        hitSlop={t.space[1]}
        accessibilityRole="button"
        accessibilityLabel={PROFILE_COPY.editProfile}
        style={[
          styles.center,
          {
            width: t.space[10],
            height: t.space[10],
            borderRadius: t.radius.pill,
            borderWidth: t.layout.hairline,
            borderColor: t.colors.border,
            backgroundColor: t.colors.surface,
          },
        ]}
      >
        <Pencil color={t.colors.textPrimary} size={t.icon.meta} strokeWidth={t.icon.stroke} />
      </AppPressable>
    </View>
  );
};

export default ProfileHero;

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
  },
  row: {
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
