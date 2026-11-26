import { AppPlaceholderScreen } from '@/shared/components';

import { COMING_SOON_COPY } from '../constants/profile.constants';

type ComingSoonScreenProps = {
  title: string;
};

// Holds the final route for a screen that isn't built yet, so only its content changes later.
const ComingSoonScreen = ({ title }: ComingSoonScreenProps) => (
  <AppPlaceholderScreen title={title} description={COMING_SOON_COPY.body} back />
);

export default ComingSoonScreen;
