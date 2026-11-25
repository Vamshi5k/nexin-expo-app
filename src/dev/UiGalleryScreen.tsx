import { zodResolver } from '@hookform/resolvers/zod';
import {
  Bell,
  Camera,
  CircleAlert,
  CreditCard,
  Inbox,
  Info,
  Layers,
  LogOut,
  Loader,
  Phone,
  Plus,
  SquareCheck,
  Wallet,
  X,
  Zap,
} from 'lucide-react-native';
import { Fragment, useEffect, useState, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { View } from 'react-native';
import { z } from 'zod';

import { brand, phonePattern, type ConnectorStatus } from '@/core/config';
import { showPermissionBlocked } from '@/core/permissions';
import {
  ThemeScope,
  useSchemeOverride,
  useTheme,
  type ColorScheme,
  type Palette,
  type TypeVariant,
} from '@/shared/theme';
import {
  AppBadge,
  AppBrandLogo,
  AppButton,
  AppCard,
  CONNECTOR_TYPES,
  AppConnectorIcon,
  AppDialog,
  AppEmptyState,
  AppErrorState,
  AppFormInput,
  AppHeader,
  AppInput,
  AppLargeTitleScroll,
  AppListGroup,
  AppListRow,
  AppSegmentedControl,
  AppSheet,
  AppSkeleton,
  AppSkeletonText,
  AppStatusChip,
  AppText,
} from '@/shared/components';
import { toast } from '@/shared/utils/toast';

const SECTIONS: Record<string, () => ReactNode> = {
  appearance: () => <SchemeSection />,
  modes: () => <ModesSection />,
  colors: () => <ColorsSection />,
  type: () => <TypeSection />,
  buttons: () => <ButtonsSection />,
  inputs: () => <InputsSection />,
  cards: () => <CardsSection />,
  lists: () => <ListsSection />,
  chips: () => <ChipsSection />,
  connectors: () => <ConnectorsSection />,
  states: () => <StatesSection />,
  overlays: () => <OverlaysSection />,
  toasts: () => <ToastsSection />,
  brand: () => <BrandSection />,
};

export type UiGalleryScreenProps = {
  initialScheme?: ColorScheme;
  section?: string;
};

export function UiGalleryScreen({ initialScheme, section }: UiGalleryScreenProps) {
  const t = useTheme();
  const { setSchemeOverride } = useSchemeOverride();
  useEffect(() => {
    if (initialScheme) setSchemeOverride(initialScheme);
  }, [initialScheme, setSchemeOverride]);
  useEffect(() => () => setSchemeOverride(null), [setSchemeOverride]);

  const keys = section && SECTIONS[section] ? [section] : Object.keys(SECTIONS);
  return (
    <AppLargeTitleScroll title="UI kit" subtitle={`${brand.appName} · ${t.scheme} mode`} back>
      <View style={{ gap: t.layout.sectionGapLarge }}>
        {keys.map(k => (
          <Fragment key={k}>{SECTIONS[k]()}</Fragment>
        ))}
      </View>
    </AppLargeTitleScroll>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  const t = useTheme();
  return (
    <View style={{ gap: t.space[4] }}>
      <View style={{ gap: t.space[1] }}>
        <AppText variant="title2" accessibilityRole="header">
          {title}
        </AppText>
        {description ? (
          <AppText variant="callout" tone="secondary">
            {description}
          </AppText>
        ) : null}
      </View>
      {children}
    </View>
  );
}

function Pair({ children }: { children: [ReactNode, ReactNode] }) {
  const t = useTheme();
  return (
    <View style={{ flexDirection: 'row', gap: t.space[3] }}>
      <View style={{ flex: 1 }}>{children[0]}</View>
      <View style={{ flex: 1 }}>{children[1]}</View>
    </View>
  );
}

function Row({ children }: { children: ReactNode }) {
  const t = useTheme();
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: t.space[2], alignItems: 'center' }}>
      {children}
    </View>
  );
}

function SchemeSection() {
  const { schemeOverride, setSchemeOverride } = useSchemeOverride();
  return (
    <Section
      title="Appearance"
      description={`The app follows brand.appearance (${brand.appearance}). Force a scheme here.`}
    >
      <AppSegmentedControl
        accessibilityLabel="Colour scheme"
        segments={[
          { value: 'brand', label: `Brand (${brand.appearance})` },
          { value: 'light', label: 'Light' },
          { value: 'dark', label: 'Dark' },
        ]}
        value={schemeOverride ?? 'brand'}
        onChange={v => setSchemeOverride(v === 'brand' ? null : v)}
      />
    </Section>
  );
}

function ModePreview() {
  const t = useTheme();
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: t.colors.bg,
        borderRadius: t.radius.card,
        borderWidth: t.layout.hairline,
        borderColor: t.colors.border,
        padding: t.space[3],
        gap: t.space[3],
      }}
    >
      <AppText variant="caption" tone="secondary">
        {t.scheme === 'light' ? 'Light' : 'Dark'}
      </AppText>
      <AppCard padded={false} style={{ padding: t.space[3], gap: t.space[1] }}>
        <AppText variant="caption" tone="secondary">
          Wallet balance
        </AppText>
        <AppText variant="title2" tabular>
          {brand.currency.symbol}1,250
        </AppText>
      </AppCard>
      <AppStatusChip label="Available" connector="Available" />
      <AppButton label="Start" size="medium" fullWidth haptic={false} onPress={() => undefined} />
      <AppButton
        label="Details"
        size="medium"
        variant="secondary"
        fullWidth
        haptic={false}
        onPress={() => undefined}
      />
      <AppText variant="subhead" tone="accent">
        See all
      </AppText>
    </View>
  );
}

function ModesSection() {
  const t = useTheme();
  return (
    <Section
      title="Light and dark"
      description="Every token and component renders in both schemes."
    >
      <View style={{ flexDirection: 'row', gap: t.space[3] }}>
        <ThemeScope scheme="light">
          <ModePreview />
        </ThemeScope>
        <ThemeScope scheme="dark">
          <ModePreview />
        </ThemeScope>
      </View>
    </Section>
  );
}

const SWATCHES: (keyof Palette)[] = [
  'bg',
  'surface',
  'surfaceRaised',
  'surfaceSunken',
  'border',
  'borderStrong',
  'textPrimary',
  'textSecondary',
  'textTertiary',
  'accent',
  'accentSoft',
  'accentText',
  'onAccent',
  'success',
  'warning',
  'danger',
];

function ColorsSection() {
  const t = useTheme();
  return (
    <Section
      title="Colour tokens"
      description="Neutrals by default. The brand fills only the primary action and selections."
    >
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: t.space[3] }}>
        {SWATCHES.map(key => (
          <View key={key} style={{ width: '30%', flexGrow: 1, gap: t.space[1] }}>
            <View
              style={{
                height: 44,
                borderRadius: t.radius.control,
                backgroundColor: t.colors[key] as string,
                borderWidth: t.layout.hairline,
                borderColor: t.colors.border,
              }}
            />
            <AppText variant="caption">{key}</AppText>
            <AppText variant="caption" tone="tertiary">
              {t.colors[key] as string}
            </AppText>
          </View>
        ))}
      </View>
      <View style={{ flexDirection: 'row', borderRadius: t.radius.control, overflow: 'hidden' }}>
        {Object.entries(t.colors.neutral).map(([step, color]) => (
          <View key={step} style={{ flex: 1, height: 28, backgroundColor: color }} />
        ))}
      </View>
      <AppText variant="caption" tone="tertiary">
        Neutral scale 50–950, tinted towards the brand hue
      </AppText>
    </Section>
  );
}

const VARIANTS: TypeVariant[] = [
  'display',
  'title1',
  'title2',
  'headline',
  'body',
  'callout',
  'subhead',
  'caption',
];

function TypeSection() {
  const t = useTheme();
  return (
    <Section title="Typography">
      {VARIANTS.map(v => (
        <AppText key={v} variant={v}>
          {v} · {t.type[v].fontSize}/{t.type[v].lineHeight}
        </AppText>
      ))}
      <Row>
        <AppText variant="title1" tabular>
          ₹1,234.50
        </AppText>
        <AppText variant="title1" tabular tone="accent">
          42.7 kWh
        </AppText>
      </Row>
      <Row>
        <AppText tone="secondary">secondary</AppText>
        <AppText tone="tertiary">tertiary</AppText>
        <AppText tone="accent">accent</AppText>
        <AppText tone="success">success</AppText>
        <AppText tone="warning">warning</AppText>
        <AppText tone="danger">danger</AppText>
      </Row>
    </Section>
  );
}

function ButtonsSection() {
  const [loading, setLoading] = useState(false);
  const t = useTheme();
  return (
    <Section title="Buttons" description="One primary per screen. Secondary is never brand-filled.">
      <View style={{ gap: t.space[3] }}>
        <AppButton
          label="Start charging"
          icon={Zap}
          onPress={() => toast.info('Primary pressed')}
        />
        <AppButton label="View details" variant="secondary" onPress={() => undefined} />
        <Pair>
          <AppButton label="Ghost" variant="ghost" onPress={() => undefined} />
          <AppButton
            label={loading ? 'Loading' : 'Load'}
            variant="secondary"
            loading={loading}
            onPress={() => {
              setLoading(true);
              setTimeout(() => setLoading(false), 1500);
            }}
          />
        </Pair>
        <Pair>
          <AppButton label="Delete" variant="danger" haptic="warning" onPress={() => undefined} />
          <AppButton label="Disabled" disabled onPress={() => undefined} />
        </Pair>
        <AppButton
          label="Stop charging"
          variant="dangerOutline"
          haptic="warning"
          onPress={() => undefined}
        />
        <AppText variant="subhead" tone="secondary" style={{ marginTop: t.space[2] }}>
          Medium (44) for inline actions
        </AppText>
        <Row>
          <AppButton label="Add vehicle" size="medium" icon={Plus} onPress={() => undefined} />
          <AppButton label="Retry" size="medium" variant="secondary" onPress={() => undefined} />
          <AppButton label="Skip" size="medium" variant="ghost" onPress={() => undefined} />
        </Row>
      </View>
    </Section>
  );
}

const phoneForm = z.object({
  phone: z
    .string()
    .length(brand.phoneLength, `Enter a ${brand.phoneLength}-digit number`)
    .regex(phonePattern, 'Enter a valid phone number'),
});

function InputsSection() {
  const t = useTheme();
  const { control, handleSubmit } = useForm<z.infer<typeof phoneForm>>({
    resolver: zodResolver(phoneForm),
    defaultValues: { phone: '' },
  });
  return (
    <Section title="Inputs" description="Sunken neutral fill; brand border and ring on focus.">
      <View style={{ gap: t.space[4] }}>
        <AppInput label="Plain" placeholder="Type here" />
        <AppInput
          label="With icon and hint"
          icon={Phone}
          placeholder="Phone"
          hint="We'll send an OTP"
        />
        <AppInput label="Error" defaultValue="abc" error="This value is not valid" />
        <AppInput label="Disabled" defaultValue="Read only" editable={false} />
        <AppFormInput
          control={control}
          name="phone"
          label="FormInput (react-hook-form + zod)"
          icon={Phone}
          keyboardType="phone-pad"
          maxLength={brand.phoneLength}
          placeholder="Phone number"
        />
        <AppButton
          label="Validate form"
          variant="secondary"
          onPress={handleSubmit(v => toast.success(`Valid: ${v.phone}`))}
        />
      </View>
    </Section>
  );
}

function CardsSection() {
  const t = useTheme();
  return (
    <Section title="Cards">
      <AppCard elevation="elevated" style={{ gap: t.space[2] }}>
        <AppText variant="subhead" tone="secondary">
          Wallet balance
        </AppText>
        <AppText variant="display" tabular>
          {brand.currency.symbol}1,250.00
        </AppText>
        <View style={{ flexDirection: 'row', gap: t.space[2], marginTop: t.space[2] }}>
          <AppButton label="Add money" size="medium" icon={Plus} onPress={() => undefined} />
          <AppButton label="History" size="medium" variant="secondary" onPress={() => undefined} />
        </View>
      </AppCard>
      <AppCard style={{ gap: t.space[1] }}>
        <AppText variant="headline">Flat card</AppText>
        <AppText tone="secondary">White surface, neutral hairline border, radius 16.</AppText>
      </AppCard>
      <AppCard onPress={() => toast.info('Card pressed')} accessibilityLabel="Pressable card">
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.space[3] }}>
          <View style={{ flex: 1, gap: t.space[1] }}>
            <AppText variant="headline">Pressable card</AppText>
            <AppText tone="secondary">Scales to 0.98 when pressed.</AppText>
          </View>
          <AppBadge label="New" />
        </View>
      </AppCard>
    </Section>
  );
}

function ListsSection() {
  return (
    <Section title="Grouped lists" description="Settings-style screens (Profile, Edit profile).">
      <AppListGroup title="Account">
        <AppListRow
          icon={Wallet}
          title="Wallet"
          value={`${brand.currency.symbol}1,250`}
          onPress={() => undefined}
        />
        <AppListRow
          icon={CreditCard}
          title="Payment history"
          subtitle="Top-ups and charging sessions"
          onPress={() => undefined}
        />
        <AppListRow icon={Bell} title="Notifications" value="On" onPress={() => undefined} />
      </AppListGroup>
      <AppListGroup footer="You can sign back in at any time.">
        <AppListRow icon={LogOut} title="Log out" destructive onPress={() => undefined} />
      </AppListGroup>
    </Section>
  );
}

const CONNECTOR_STATUSES: ConnectorStatus[] = [
  'Available',
  'Charging',
  'Unavailable',
  'Faulted',
  'Reserved',
  'Unknown',
];

function ChipsSection() {
  return (
    <Section title="Status chips and badges">
      <Row>
        <AppStatusChip label="Success" tone="success" />
        <AppStatusChip label="Warning" tone="warning" />
        <AppStatusChip label="Danger" tone="danger" />
        <AppStatusChip label="Accent" tone="accent" />
        <AppStatusChip label="Neutral" />
      </Row>
      <Row>
        {CONNECTOR_STATUSES.map(s => (
          <AppStatusChip key={s} label={s} connector={s} />
        ))}
      </Row>
      <Row>
        <AppBadge label={3} />
        <AppBadge label="Primary" tone="neutral" />
        <AppBadge label={12} tone="danger" />
      </Row>
    </Section>
  );
}

function ConnectorsSection() {
  const t = useTheme();
  return (
    <Section title="Connector icons">
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: t.space[4] }}>
        {CONNECTOR_TYPES.map(type => (
          <AppConnectorIcon key={type} type={type} showLabel />
        ))}
      </View>
      <Row>
        <AppConnectorIcon type="CCS2" available={false} showLabel />
        <AppText variant="caption" tone="tertiary">
          Unavailable
        </AppText>
      </Row>
    </Section>
  );
}

function StatesSection() {
  const t = useTheme();
  return (
    <Section title="Loading, empty and error">
      <AppCard>
        <View style={{ flexDirection: 'row', gap: t.space[3] }}>
          <AppSkeleton width={56} height={56} radius={t.radius.control} />
          <View style={{ flex: 1, gap: t.space[2] }}>
            <AppSkeleton height={16} width="70%" />
            <AppSkeletonText lines={2} />
          </View>
        </View>
      </AppCard>
      <AppCard>
        <AppEmptyState
          icon={Inbox}
          title="No sessions yet"
          description="Your charging sessions will show up here."
          actionLabel="Find a charger"
          onAction={() => toast.info('Empty state action')}
        />
      </AppCard>
      <AppCard>
        <AppErrorState
          message="We couldn't load this. Check your connection and try again."
          onRetry={() => toast.info('Retry')}
        />
      </AppCard>
    </Section>
  );
}

function OverlaysSection() {
  const t = useTheme();
  const [sheet, setSheet] = useState(false);
  const [dialog, setDialog] = useState(false);
  const [tab, setTab] = useState<'ac' | 'dc'>('ac');
  return (
    <Section title="Header, sheet, dialog, segmented">
      <AppCard padded={false}>
        <AppHeader
          title="Compact header"
          back={() => toast.info('Back')}
          right={<AppBadge label={2} />}
        />
      </AppCard>
      <AppSegmentedControl
        segments={[
          { value: 'ac', label: 'AC' },
          { value: 'dc', label: 'DC' },
        ]}
        value={tab}
        onChange={setTab}
      />
      <AppListGroup>
        <AppListRow icon={Layers} title="Open bottom sheet" onPress={() => setSheet(true)} />
        <AppListRow
          icon={CircleAlert}
          iconTone="danger"
          title="Open destructive dialog"
          onPress={() => setDialog(true)}
        />
        <AppListRow
          icon={Camera}
          iconTone="neutral"
          title="Permission blocked (camera)"
          onPress={() => void showPermissionBlocked('camera')}
        />
      </AppListGroup>
      <AppSheet
        open={sheet}
        onClose={() => setSheet(false)}
        title="Bottom sheet"
        description="For choices, filters and confirmations."
      >
        <View style={{ gap: t.space[3] }}>
          <AppButton label="Confirm" onPress={() => setSheet(false)} />
          <AppButton label="Cancel" variant="secondary" onPress={() => setSheet(false)} />
        </View>
      </AppSheet>
      <AppDialog
        open={dialog}
        destructive
        title="Remove vehicle?"
        message="Only for destructive or blocking actions."
        confirmLabel="Remove"
        onConfirm={() => {
          setDialog(false);
          toast.success('Removed');
        }}
        onCancel={() => setDialog(false)}
      />
    </Section>
  );
}

function ToastsSection() {
  const wait = (ms: number, ok: boolean) =>
    new Promise<string>((resolve, reject) =>
      setTimeout(() => (ok ? resolve('done') : reject(new Error('failed'))), ms),
    );
  return (
    <Section title="Toasts">
      <AppListGroup>
        <AppListRow
          icon={SquareCheck}
          title="Success"
          onPress={() => toast.success('Payment successful')}
        />
        <AppListRow
          icon={X}
          iconTone="danger"
          title="Error"
          onPress={() => toast.error('Payment failed', { description: 'No money was taken.' })}
        />
        <AppListRow
          icon={Info}
          iconTone="neutral"
          title="Info"
          onPress={() => toast.info('Charger is preparing')}
        />
        <AppListRow
          icon={Loader}
          iconTone="neutral"
          title="Promise (resolves)"
          onPress={() =>
            toast.promise(wait(1500, true), {
              loading: 'Starting…',
              success: 'Charging started',
              error: 'Could not start',
            })
          }
        />
        <AppListRow
          icon={Loader}
          iconTone="neutral"
          title="Promise (rejects)"
          onPress={() =>
            toast.promise(wait(1500, false), {
              loading: 'Starting…',
              success: 'Charging started',
              error: 'Could not start',
            })
          }
        />
      </AppListGroup>
    </Section>
  );
}

function BrandSection() {
  const t = useTheme();
  return (
    <Section title="Brand">
      <AppCard style={{ alignItems: 'center', gap: t.space[3], paddingVertical: t.space[6] }}>
        <AppBrandLogo height={44} />
        <AppText variant="caption" tone="tertiary" align="center">
          Build-time logo. The runtime logo arrives in Phase 2.
        </AppText>
      </AppCard>
    </Section>
  );
}
