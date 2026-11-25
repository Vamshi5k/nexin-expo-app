import { CircleAlert, WifiOff } from 'lucide-react-native';

import { EmptyState } from './EmptyState';

export type ErrorStateProps = {
  message: string;
  title?: string;
  onRetry?: () => void;
  retryLabel?: string;
  offline?: boolean;
};

export function ErrorState({
  message,
  title = 'Something went wrong',
  onRetry,
  retryLabel = 'Retry',
  offline,
}: ErrorStateProps) {
  return (
    <EmptyState
      icon={offline ? WifiOff : CircleAlert}
      title={title}
      description={message}
      actionLabel={onRetry ? retryLabel : undefined}
      onAction={onRetry}
    />
  );
}
