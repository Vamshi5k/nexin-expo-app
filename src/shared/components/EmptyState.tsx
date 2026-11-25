import type { LucideIcon } from 'lucide-react-native';
import { View } from 'react-native';

import { useTheme } from '@/shared/theme';

import { Button } from './Button';
import { Text } from './Text';

export type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
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
      <Text variant="headline" align="center" numberOfLines={1}>
        {title}
      </Text>
      {description ? (
        <Text variant="callout" tone="secondary" align="center">
          {description}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <Button
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
