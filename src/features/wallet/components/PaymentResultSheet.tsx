import { StyleSheet, View } from 'react-native';

import { RefreshCcw, Wallet } from 'lucide-react-native';

import { AppButton, AppSheet, AppText } from '@/shared/components';

import ResultArt from './ResultArt';

import { useTheme } from '@/shared/theme';

import { formatPaise } from '@/shared/utils/money';

import { ADD_MONEY_COPY } from '../constants/wallet.constants';
import type { PaymentOutcome } from '../types/wallet.types';

type PaymentResultSheetProps = {
  outcome: PaymentOutcome | null;
  onClose: () => void;
  onRetry: () => void;
};

type DetailRowProps = {
  label: string;
  value: string;
};

const DetailRow = ({ label, value }: DetailRowProps) => {
  const t = useTheme();

  return (
    <View style={[styles.row, { gap: t.space[3] }]}>
      <AppText variant="caption" tone="secondary">
        {label}
      </AppText>
      <AppText
        variant="subhead"
        tabular
        numberOfLines={1}
        style={[styles.value, { fontFamily: t.type.headline.fontFamily }]}
      >
        {value}
      </AppText>
    </View>
  );
};

// Success, failure or "not confirmed", each with its own drawn mark. A payment that went through
// but didn't verify has no retry: paying again could charge twice.
const PaymentResultSheet = ({ outcome, onClose, onRetry }: PaymentResultSheetProps) => {
  const t = useTheme();
  const kind = outcome?.kind ?? 'success';

  const content = (() => {
    if (!outcome) return null;

    if (outcome.kind === 'success') {
      const credits = formatPaise(outcome.creditedPaise);
      return {
        title: ADD_MONEY_COPY.successTitle,
        body: ADD_MONEY_COPY.successBody(credits),
        details: [
          { label: ADD_MONEY_COPY.amountAdded, value: credits },
          { label: ADD_MONEY_COPY.transactionId, value: outcome.orderId },
        ],
      };
    }

    if (outcome.kind === 'failed') {
      return { title: ADD_MONEY_COPY.failedTitle, body: outcome.message, details: [] };
    }

    return {
      title: ADD_MONEY_COPY.unconfirmedTitle,
      body: ADD_MONEY_COPY.unconfirmedBody(outcome.orderId),
      details: [],
    };
  })();

  return (
    <AppSheet open={outcome !== null} onClose={onClose}>
      {content ? (
        <View style={[styles.center, { gap: t.space[4] }]}>
          <ResultArt key={kind} kind={kind} size={t.space[12] * 3} />
          <View style={[styles.center, { gap: t.space[2] }]}>
            <AppText variant="headline" align="center" accessibilityRole="header">
              {content.title}
            </AppText>
            <AppText variant="subhead" tone="secondary" align="center">
              {content.body}
            </AppText>
          </View>

          {content.details.length ? (
            <View
              style={[
                styles.details,
                {
                  gap: t.space[2],
                  padding: t.space[4],
                  borderRadius: t.radius.card,
                  backgroundColor: t.colors.surfaceSunken,
                },
              ]}
            >
              {content.details.map(detail => (
                <DetailRow key={detail.label} {...detail} />
              ))}
            </View>
          ) : null}

          <View style={[styles.details, { gap: t.space[3] }]}>
            {kind === 'failed' ? (
              <>
                <AppButton label={ADD_MONEY_COPY.tryAgain} icon={RefreshCcw} onPress={onRetry} />
                <AppButton label={ADD_MONEY_COPY.dismiss} variant="secondary" onPress={onClose} />
              </>
            ) : (
              <AppButton
                label={kind === 'success' ? ADD_MONEY_COPY.continue : ADD_MONEY_COPY.close}
                icon={kind === 'success' ? Wallet : undefined}
                onPress={onClose}
              />
            )}
          </View>
        </View>
      ) : null}
    </AppSheet>
  );
};

export default PaymentResultSheet;

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
  },
  details: {
    alignSelf: 'stretch',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  value: {
    flexShrink: 1,
    textAlign: 'right',
  },
});
