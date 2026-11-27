import { StyleSheet, View } from 'react-native';

import { Download, Info } from 'lucide-react-native';
import Animated from 'react-native-reanimated';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

import {
  AppButton,
  AppErrorState,
  AppPageHeader,
  AppScreen,
  AppSkeleton,
  AppText,
} from '@/shared/components';

import InvoiceSection, { type InvoiceLine } from '../components/InvoiceSection';

import { useTheme, withAlpha } from '@/shared/theme';

import { brand } from '@/core/config';
import { formatPaise, formatRate } from '@/shared/utils/money';
import { riseIn } from '@/shared/utils/motion';

import {
  HISTORY_COPY,
  HISTORY_HREF,
  INVOICE_COPY,
  STATUS_COPY,
} from '../constants/history.constants';
import { useInvoice } from '../hooks/useInvoice';
import { formatDateTime, formatDuration, formatKwh, halfPercent } from '../utils/history';

type InvoiceScreenProps = {
  id: string;
};

const GLOW = 0.14;

const money = (paise: number | null) => (paise === null ? null : formatPaise(paise));

// Invoice (BLUEPRINT C5): a receipt card with the station and the total, then session,
// location and billing, and Download Invoice (the PDF, into Files / Downloads via the share
// sheet). An active session shows a note instead of the download.
const InvoiceScreen = ({ id }: InvoiceScreenProps) => {
  const t = useTheme();
  const screen = useInvoice(id);
  const invoice = screen.invoice;

  const header = (
    <AppPageHeader
      title={INVOICE_COPY.title}
      subtitle={INVOICE_COPY.subtitle}
      fallbackHref={HISTORY_HREF.list}
    />
  );

  if (!invoice) {
    return (
      <AppScreen scroll wash contentStyle={{ gap: t.space[4], paddingTop: t.space[2] }}>
        {header}
        {screen.failed ? (
          <AppErrorState
            title={INVOICE_COPY.loadError}
            message={screen.errorMessage}
            onRetry={screen.retry}
            retryLabel={INVOICE_COPY.retry}
          />
        ) : (
          <View testID="invoice-loading" style={{ gap: t.space[3] }}>
            <AppSkeleton height={t.space[12] * 3} radius={t.radius.card} />
            <AppSkeleton height={t.space[12] * 4} radius={t.radius.card} />
            <AppSkeleton height={t.space[12] * 3} radius={t.radius.card} />
          </View>
        )}
      </AppScreen>
    );
  }

  const done = invoice.status === 'completed' || invoice.status === null;
  const tone =
    invoice.status === 'active'
      ? { dot: t.colors.accent, ink: t.colors.accentText }
      : invoice.status === 'failed'
        ? { dot: t.colors.danger, ink: t.colors.dangerText }
        : { dot: t.colors.success, ink: t.colors.successText };
  const half = invoice.taxPaise !== null ? Math.round(invoice.taxPaise / 2) : null;
  const percent = invoice.taxPercent !== null ? halfPercent(invoice.taxPercent) : null;
  const connector = [
    invoice.connectorType,
    invoice.connectorId ? HISTORY_COPY.connector(invoice.connectorId) : null,
  ]
    .filter(Boolean)
    .join(' · ');

  const session: InvoiceLine[] = [
    { label: INVOICE_COPY.dateTime, value: formatDateTime(invoice.startedAt, brand.locale) },
    { label: INVOICE_COPY.energy, value: formatKwh(invoice.energyKwh), divider: true },
    { label: INVOICE_COPY.duration, value: formatDuration(invoice.durationMin), divider: true },
    {
      label: INVOICE_COPY.battery,
      value:
        invoice.startSoc !== null && invoice.stopSoc !== null
          ? INVOICE_COPY.soc(invoice.startSoc, invoice.stopSoc)
          : null,
      divider: true,
    },
    { label: INVOICE_COPY.chargerType, value: invoice.chargerType, divider: true },
    { label: INVOICE_COPY.connector, value: connector || null, divider: true },
    { label: INVOICE_COPY.chargerId, value: invoice.chargerId, divider: true },
  ];
  const location: InvoiceLine[] = [
    { label: INVOICE_COPY.address, value: invoice.address || null },
    { label: INVOICE_COPY.vehicle, value: invoice.vehicleRegNo, divider: true },
    { label: INVOICE_COPY.helpLine, value: invoice.helpNumber, divider: true },
  ];
  const billing: InvoiceLine[] = [
    { label: INVOICE_COPY.energyCharge, value: money(invoice.energyPaise) },
    {
      label: INVOICE_COPY.rate,
      value:
        invoice.ratePaise !== null ? INVOICE_COPY.ratePerKwh(formatRate(invoice.ratePaise)) : null,
      divider: true,
    },
    {
      label: percent ? INVOICE_COPY.sgst(percent) : INVOICE_COPY.tax,
      value: money(half),
      divider: true,
    },
    ...(percent ? [{ label: INVOICE_COPY.cgst(percent), value: money(half), divider: true }] : []),
    { label: INVOICE_COPY.total, value: money(invoice.totalPaise), strong: true, divider: true },
  ];

  return (
    <AppScreen
      scroll
      wash
      contentStyle={{ gap: t.space[4], paddingTop: t.space[2] }}
      footer={
        done ? (
          <AppButton
            label={screen.downloading ? INVOICE_COPY.downloading : INVOICE_COPY.download}
            icon={Download}
            onPress={screen.download}
            loading={screen.downloading}
          />
        ) : undefined
      }
    >
      {header}

      <Animated.View
        entering={riseIn(1)}
        style={[
          styles.clip,
          {
            gap: t.space[3],
            padding: t.space[4],
            borderRadius: t.radius.card,
            borderWidth: t.layout.hairline,
            borderColor: t.colors.border,
            backgroundColor: t.colors.surfaceRaised,
          },
        ]}
      >
        <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
          <Defs>
            <RadialGradient id={`invoice-glow-${invoice.id}`} cx="100%" cy="0%" rx="60%" ry="90%">
              <Stop offset="0" stopColor={tone.dot} stopOpacity={GLOW} />
              <Stop offset="1" stopColor={tone.dot} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Rect x="0" y="0" width="100%" height="100%" fill={`url(#invoice-glow-${invoice.id})`} />
        </Svg>

        <View style={[styles.row, { gap: t.space[2] }]}>
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: t.radius.pill,
              backgroundColor: tone.dot,
              boxShadow: `0 0 6px 1px ${withAlpha(tone.dot, 0.55)}`,
            }}
          />
          <AppText
            variant="caption"
            style={{ fontFamily: t.type.headline.fontFamily, color: tone.ink }}
          >
            {invoice.status ? STATUS_COPY[invoice.status] : STATUS_COPY.completed}
          </AppText>
        </View>

        <View style={{ gap: t.space[1] / 2 }}>
          <AppText
            variant="subhead"
            numberOfLines={2}
            style={{ fontFamily: t.type.headline.fontFamily }}
          >
            {invoice.stationName || HISTORY_COPY.unknownStation}
          </AppText>
          {formatDateTime(invoice.startedAt, brand.locale) ? (
            <AppText variant="caption" tone="secondary" tabular>
              {formatDateTime(invoice.startedAt, brand.locale)}
            </AppText>
          ) : null}
        </View>

        <View style={[styles.row, styles.between, { gap: t.space[3] }]}>
          <View>
            <AppText variant="caption" tone="secondary">
              {INVOICE_COPY.totalPaid}
            </AppText>
            <AppText variant="title2" tabular>
              {money(invoice.totalPaise) ?? '—'}
            </AppText>
          </View>
          {invoice.transactionId ? (
            <View
              style={{
                alignItems: 'flex-end',
                paddingHorizontal: t.space[2],
                paddingVertical: t.space[1],
                borderRadius: t.radius.control,
                backgroundColor: t.colors.surfaceSunken,
              }}
            >
              <AppText variant="caption" tone="secondary">
                {INVOICE_COPY.sessionId}
              </AppText>
              <AppText variant="caption" tabular style={{ fontFamily: t.type.headline.fontFamily }}>
                {invoice.transactionId}
              </AppText>
            </View>
          ) : null}
        </View>
      </Animated.View>

      {!done ? (
        <View
          style={[
            styles.row,
            {
              gap: t.space[2],
              padding: t.space[3],
              borderRadius: t.radius.control,
              backgroundColor: t.colors.accentSoft,
            },
          ]}
        >
          <Info color={t.colors.accentText} size={t.icon.meta} strokeWidth={t.icon.stroke} />
          <AppText variant="caption" style={{ flex: 1, color: t.colors.accentText }}>
            {INVOICE_COPY.activeNote}
          </AppText>
        </View>
      ) : null}

      <InvoiceSection title={INVOICE_COPY.session} lines={session} step={2} />
      <InvoiceSection title={INVOICE_COPY.location} lines={location} step={3} />
      <InvoiceSection title={INVOICE_COPY.billing} lines={billing} step={4} />
    </AppScreen>
  );
};

export default InvoiceScreen;

const styles = StyleSheet.create({
  clip: {
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  between: {
    justifyContent: 'space-between',
  },
});
