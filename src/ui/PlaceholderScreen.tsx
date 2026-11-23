import { Construction } from 'lucide-react-native';
import type { ReactNode } from 'react';

import { EmptyState } from './EmptyState';
import { LargeTitleScroll } from './Header';

export type PlaceholderScreenProps = {
  title: string;
  description: string;
  back?: boolean;
  children?: ReactNode;
};

/** Stand-in for a route whose real screen arrives in a later phase. */
export function PlaceholderScreen({ title, description, back, children }: PlaceholderScreenProps) {
  return (
    <LargeTitleScroll title={title} back={back}>
      <EmptyState icon={Construction} title="Coming soon" description={description} />
      {children}
    </LargeTitleScroll>
  );
}
