import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/shared/theme';

import AppPressable from './AppPressable';
import AppText from './AppText';

export const HEADER_BAR_HEIGHT = 44;

export type AppHeaderProps = {
  title?: string;
  back?: boolean | (() => void);
  right?: ReactNode;
};

export default function AppHeader({ title, back, right }: AppHeaderProps) {
  const t = useTheme();
  const onBack = typeof back === 'function' ? back : () => router.back();
  return (
    <View style={[styles.bar, { height: HEADER_BAR_HEIGHT, paddingHorizontal: t.space[2] }]}>
      <View style={styles.side}>
        {back ? (
          <AppPressable
            onPress={onBack}
            accessibilityLabel="Back"
            style={styles.icon}
            feedback="opacity"
          >
            <ChevronLeft color={t.colors.textPrimary} size={24} strokeWidth={1.75} />
          </AppPressable>
        ) : null}
      </View>
      <AppText variant="headline" numberOfLines={1} style={styles.title} accessibilityRole="header">
        {title}
      </AppText>
      <View style={[styles.side, styles.right]}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', alignItems: 'center' },
  side: { width: 88, flexDirection: 'row', alignItems: 'center' },
  right: { justifyContent: 'flex-end' },
  title: { flex: 1, textAlign: 'center' },
  icon: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
});
