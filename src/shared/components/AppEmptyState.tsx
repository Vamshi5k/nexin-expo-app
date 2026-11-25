import type { LucideIcon } from 'lucide-react-native';
import { View } from 'react-native';

import { useTheme } from '@/shared/theme';

import AppButton from './AppButton';
import AppText from './AppText';

export type AppEmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export default function AppEmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: AppEmptyStateProps) {
  const t = useTheme();
  return (
    <View
      style={{
        alignItems: 'center',
        paddingVertical: t.space[8],
        paddingHorizontal: t.space[4],
        gap: t.space[3],
      }}
    >
      <View
        style={{
          width: 64,
          height: 64,
          borderRadius: t.radius.pill,
          backgroundColor: t.colors.accentSoft,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: t.space[1],
        }}
      >
        <Icon color={t.colors.accentText} size={28} strokeWidth={1.75} />
      </View>
      <AppText variant="headline" align="center" numberOfLines={1}>
        {title}
      </AppText>
      {description ? (
        <AppText variant="callout" tone="secondary" align="center">
          {description}
        </AppText>
      ) : null}
      {actionLabel && onAction ? (
        <AppButton
          label={actionLabel}
          onPress={onAction}
          variant="secondary"
          fullWidth={false}
          style={{ marginTop: t.space[2], alignSelf: 'center' }}
        />
      ) : null}
    </View>
  );
}
