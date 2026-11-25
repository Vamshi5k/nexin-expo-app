import { StyleSheet, View } from 'react-native';

import { AppText } from '@/shared/components';

import LegalLink from './LegalLink';

type TermsLineProps = {
  onTerms: () => void;
  onPrivacy: () => void;
};

const TermsLine = ({ onTerms, onPrivacy }: TermsLineProps) => {
  return (
    <View style={styles.row}>
      <AppText variant="caption" tone="secondary">
        By continuing, you agree to our{' '}
      </AppText>
      <LegalLink label="Terms" onPress={onTerms} />
      <AppText variant="caption" tone="secondary">
        {' '}
        and{' '}
      </AppText>
      <LegalLink label="Privacy" onPress={onPrivacy} />
    </View>
  );
};

export default TermsLine;

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
});
