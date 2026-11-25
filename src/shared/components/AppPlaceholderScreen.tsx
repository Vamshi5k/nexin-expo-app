import type { ReactNode } from 'react';

import { Construction } from 'lucide-react-native';

import AppEmptyState from './AppEmptyState';
import AppLargeTitleScroll from './AppLargeTitleScroll';

export type AppPlaceholderScreenProps = {
  title: string;
  description: string;
  back?: boolean;
  children?: ReactNode;
};

const AppPlaceholderScreen = ({
  title,
  description,
  back,
  children,
}: AppPlaceholderScreenProps) => {
  return (
    <AppLargeTitleScroll title={title} back={back}>
      <AppEmptyState icon={Construction} title="Coming soon" description={description} />
      {children}
    </AppLargeTitleScroll>
  );
};

export default AppPlaceholderScreen;
