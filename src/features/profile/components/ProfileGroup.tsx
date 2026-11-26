import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/shared/components';

import { useTheme } from '@/shared/theme';

type ProfileGroupProps = {
  title?: string;
  children: ReactNode;
};

// A small uppercase label over one white card of rows.
const ProfileGroup = ({ title, children }: ProfileGroupProps) => {
  const t = useTheme();

  return (
    <View style={{ gap: t.space[2] }}>
      {title ? (
        <AppText
          variant="caption"
          tone="secondary"
          accessibilityRole="header"
          style={[styles.overline, { paddingHorizontal: t.space[1] }]}
        >
          {title}
        </AppText>
      ) : null}
      <View
        style={{
          paddingHorizontal: t.space[3],
          borderRadius: t.radius.card,
          borderWidth: t.layout.hairline,
          borderColor: t.colors.border,
          backgroundColor: t.colors.surfaceRaised,
        }}
      >
        {children}
      </View>
    </View>
  );
};

export default ProfileGroup;

const styles = StyleSheet.create({
  overline: {
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
