import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { Building2, MapPin, Phone, PlugZap, X, type LucideIcon } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppPressable, AppText } from '@/shared/components';

import AmenityChip from './AmenityChip';

import { useTheme } from '@/shared/theme';

import { DETAILS_COPY } from '../constants/stations.constants';
import type { StationDetails } from '../types/stations.types';

type StationInfoSheetProps = {
  open: boolean;
  station: StationDetails;
  onClose: () => void;
  onCopyAddress: () => void;
  onCall: () => void;
};

type InfoRowProps = {
  icon: LucideIcon;
  label: string;
  value: string;
  first?: boolean;
  onPress?: () => void;
  action?: ReactNode;
};

const SNAP_POINTS = ['60%', '90%'];

const InfoRow = ({ icon: Icon, label, value, first, onPress, action }: InfoRowProps) => {
  const t = useTheme();

  const body = (
    <View
      style={[
        styles.row,
        {
          gap: t.space[3],
          paddingVertical: t.space[3],
          borderTopWidth: first ? 0 : t.layout.hairline,
          borderTopColor: t.colors.border,
        },
      ]}
    >
      <View
        style={[
          styles.center,
          {
            width: t.layout.minTouch,
            height: t.layout.minTouch,
            borderRadius: t.radius.pill,
            backgroundColor: t.colors.surfaceSunken,
          },
        ]}
      >
        <Icon color={t.colors.textPrimary} size={t.icon.control} strokeWidth={t.icon.stroke} />
      </View>
      <View style={styles.grow}>
        <AppText variant="caption" tone="secondary">
          {label}
        </AppText>
        <AppText variant="headline" tone={onPress ? 'accent' : 'primary'}>
          {value}
        </AppText>
      </View>
      {action}
    </View>
  );

  if (!onPress) return body;
  return (
    <AppPressable
      onPress={onPress}
      feedback="opacity"
      accessibilityRole="button"
      accessibilityLabel={`${label}, ${value}`}
    >
      {body}
    </AppPressable>
  );
};

// Everything about the station. Rows without data are left out, never shown as "Not available".
const StationInfoSheet = ({
  open,
  station,
  onClose,
  onCopyAddress,
  onCall,
}: StationInfoSheetProps) => {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const ref = useRef<BottomSheetModal>(null);

  // Content stays mounted while the sheet slides away, then unmounts so a closed sheet costs nothing.
  const [shown, setShown] = useState(open);
  if (open && !shown) setShown(true);

  // dismiss() on a sheet that never opened still fires onDismiss, which would close it again
  // right as it opens. Only a sheet we presented may dismiss or report back.
  const presented = useRef(false);

  const onDismiss = () => {
    if (!presented.current) return;
    presented.current = false;
    setShown(false);
    onClose();
  };

  useEffect(() => {
    if (open) {
      presented.current = true;
      ref.current?.present();
      return;
    }
    if (presented.current) ref.current?.dismiss();
  }, [open]);

  const backdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior="close"
        style={[props.style, { backgroundColor: t.colors.overlay }]}
        opacity={1}
      />
    ),
    [t.colors.overlay],
  );

  const types = [
    ...new Set(
      station.chargers.flatMap(charger =>
        charger.connectors.map(connector => connector.portType).filter(Boolean),
      ),
    ),
  ];

  const candidates: (InfoRowProps | null)[] = [
    station.address
      ? {
          icon: MapPin,
          label: DETAILS_COPY.address,
          value: station.address,
          action: (
            <AppPressable
              onPress={onCopyAddress}
              haptic="light"
              accessibilityRole="button"
              accessibilityLabel={`${DETAILS_COPY.copy} ${DETAILS_COPY.address}`}
              style={{
                paddingHorizontal: t.space[3],
                paddingVertical: t.space[2],
                borderRadius: t.radius.pill,
                backgroundColor: t.colors.surfaceSunken,
              }}
            >
              <AppText variant="subhead">{DETAILS_COPY.copy}</AppText>
            </AppPressable>
          ),
        }
      : null,
    station.phone
      ? { icon: Phone, label: DETAILS_COPY.helpLine, value: station.phone, onPress: onCall }
      : null,
    station.accessType
      ? { icon: Building2, label: DETAILS_COPY.access, value: station.accessType }
      : null,
    types.length
      ? { icon: PlugZap, label: DETAILS_COPY.connectorTypes, value: types.join(', ') }
      : null,
  ];
  const rows = candidates.filter((row): row is InfoRowProps => row !== null);

  return (
    <BottomSheetModal
      ref={ref}
      snapPoints={SNAP_POINTS}
      stackBehavior="push"
      enableDynamicSizing={false}
      onDismiss={onDismiss}
      backdropComponent={backdrop}
      backgroundStyle={{ backgroundColor: t.colors.surfaceRaised, borderRadius: t.radius.sheet }}
      handleIndicatorStyle={{ backgroundColor: t.colors.borderStrong, width: t.space[10] }}
      accessibilityLabel={DETAILS_COPY.about}
    >
      {shown ? (
        <BottomSheetScrollView
          contentContainerStyle={{
            gap: t.space[5],
            paddingHorizontal: t.layout.screenPadding,
            paddingTop: t.space[2],
            paddingBottom: Math.max(insets.bottom, t.space[4]) + t.space[4],
          }}
        >
          <View style={[styles.row, { gap: t.space[3] }]}>
            <AppText variant="title2" accessibilityRole="header" style={styles.grow}>
              {station.name}
            </AppText>
            <AppPressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel={DETAILS_COPY.close}
              style={[
                styles.center,
                {
                  width: t.layout.minTouch,
                  height: t.layout.minTouch,
                  borderRadius: t.radius.pill,
                  backgroundColor: t.colors.surfaceSunken,
                },
              ]}
            >
              <X color={t.colors.textPrimary} size={t.icon.control} strokeWidth={t.icon.stroke} />
            </AppPressable>
          </View>

          {rows.length ? (
            <View>
              {rows.map((row, index) => (
                <InfoRow key={row.label} {...row} first={index === 0} />
              ))}
            </View>
          ) : null}

          {station.amenities.length ? (
            <View style={{ gap: t.space[3] }}>
              <AppText variant="headline">{DETAILS_COPY.amenities}</AppText>
              <View style={[styles.wrap, { gap: t.space[2] }]}>
                {station.amenities.map(amenity => (
                  <AmenityChip key={amenity} label={amenity} withIcon />
                ))}
              </View>
            </View>
          ) : null}
        </BottomSheetScrollView>
      ) : null}
    </BottomSheetModal>
  );
};

export default StationInfoSheet;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  grow: {
    flex: 1,
  },
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
