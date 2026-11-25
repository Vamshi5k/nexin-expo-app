import { CircleAlert, WifiOff } from 'lucide-react-native';

import AppEmptyState from './AppEmptyState';

export type AppErrorStateProps = {
  message: string;
  title?: string;
  onRetry?: () => void;
  retryLabel?: string;
  offline?: boolean;
};

export default function AppErrorState({
  message,
  title = 'Something went wrong',
  onRetry,
  retryLabel = 'Retry',
  offline,
}: AppErrorStateProps) {
  return (
    <AppEmptyState
      icon={offline ? WifiOff : CircleAlert}
      title={title}
      description={message}
      actionLabel={onRetry ? retryLabel : undefined}
      onAction={onRetry}
    />
  );
}
