import { Construction } from 'lucide-react-native';
import type { ReactNode } from 'react';

import AppEmptyState from './AppEmptyState';
import AppLargeTitleScroll from './AppLargeTitleScroll';

export type AppPlaceholderScreenProps = {
  title: string;
  description: string;
  back?: boolean;
  children?: ReactNode;
};

export default function AppPlaceholderScreen({
  title,
  description,
  back,
  children,
}: AppPlaceholderScreenProps) {
  return (
    <AppLargeTitleScroll title={title} back={back}>
      <AppEmptyState icon={Construction} title="Coming soon" description={description} />
      {children}
    </AppLargeTitleScroll>
  );
}
