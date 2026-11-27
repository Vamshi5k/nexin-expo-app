import { StyleSheet, View } from 'react-native';

import { CreditCard, Landmark, ShieldCheck, Smartphone } from 'lucide-react-native';

import { AppText } from '@/shared/components';

import { useTheme } from '@/shared/theme';

import { ADD_MONEY_COPY } from '../constants/wallet.constants';

const METHOD_ICONS = [Smartphone, CreditCard, Landmark];

// Reassurance under the form: a secure-payment line and the ways people can pay.
const SecureStrip = () => {
  const t = useTheme();

  return (
    <View style={[styles.center, { gap: t.space[3] }]}>
      <View style={[styles.row, { gap: t.space[2] }]}>
        <ShieldCheck color={t.colors.successText} size={t.icon.meta} strokeWidth={t.icon.stroke} />
        <AppText variant="caption" tone="secondary">
          {ADD_MONEY_COPY.secure}
        </AppText>
      </View>
      <View style={[styles.row, { gap: t.space[2] }]}>
        {ADD_MONEY_COPY.methods.map((method, index) => {
          const Icon = METHOD_ICONS[index] ?? CreditCard;
          return (
            <View
              key={method}
              style={[
                styles.row,
                {
                  gap: t.space[1],
                  paddingHorizontal: t.space[3],
                  paddingVertical: t.space[1],
                  borderRadius: t.radius.pill,
                  borderWidth: t.layout.hairline,
                  borderColor: t.colors.border,
                  backgroundColor: t.colors.surfaceRaised,
                },
              ]}
            >
              <Icon color={t.colors.textSecondary} size={t.space[3]} strokeWidth={t.icon.stroke} />
              <AppText variant="caption" tone="secondary">
                {method}
              </AppText>
            </View>
          );
        })}
      </View>
    </View>
  );
};

export default SecureStrip;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  center: {
    alignItems: 'center',
  },
});
