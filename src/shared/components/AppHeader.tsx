import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import AppBackButton from './AppBackButton';
import AppText from './AppText';

import { useTheme } from '@/shared/theme';

export const HEADER_BAR_HEIGHT = 44;

export type AppHeaderProps = {
  title?: string;
  back?: boolean | (() => void);
  right?: ReactNode;
};

const AppHeader = ({ title, back, right }: AppHeaderProps) => {
  const t = useTheme();

  return (
    <View style={[styles.bar, { height: HEADER_BAR_HEIGHT, paddingHorizontal: t.space[2] }]}>
      <View style={styles.side}>
        {back ? (
          <AppBackButton variant="plain" onPress={typeof back === 'function' ? back : undefined} />
        ) : null}
      </View>
      <AppText variant="headline" numberOfLines={1} style={styles.title} accessibilityRole="header">
        {title}
      </AppText>
      <View style={[styles.side, styles.right]}>{right}</View>
    </View>
  );
};

export default AppHeader;

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', alignItems: 'center' },
  side: { width: 88, flexDirection: 'row', alignItems: 'center' },
  right: { justifyContent: 'flex-end' },
  title: { flex: 1, textAlign: 'center' },
});
