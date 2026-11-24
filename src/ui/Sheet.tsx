import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { useCallback, useEffect, useRef, type ReactNode } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/theme';

import { Text } from './Text';

export type SheetProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children?: ReactNode;
  dismissible?: boolean;
};

export function Sheet({
  open,
  onClose,
  title,
  description,
  children,
  dismissible = true,
}: SheetProps) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const ref = useRef<BottomSheetModal>(null);

  useEffect(() => {
    if (open) ref.current?.present();
    else ref.current?.dismiss();
  }, [open]);

  const backdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior={dismissible ? 'close' : 'none'}
        style={[props.style, { backgroundColor: t.colors.overlay }]}
        opacity={1}
      />
    ),
    [dismissible, t.colors.overlay],
  );

  return (
    <BottomSheetModal
      ref={ref}
      onDismiss={onClose}
      enablePanDownToClose={dismissible}
      backdropComponent={backdrop}
      backgroundStyle={{ backgroundColor: t.colors.surfaceRaised, borderRadius: t.radius.sheet }}
      handleIndicatorStyle={{ backgroundColor: t.colors.borderStrong, width: 36 }}
      accessibilityLabel={title}
    >
      <BottomSheetView
        style={{
          paddingHorizontal: t.layout.screenPadding,
          paddingTop: t.space[2],
          paddingBottom: Math.max(insets.bottom, t.space[4]) + t.space[2],
          gap: t.space[4],
        }}
      >
        {title || description ? (
          <View style={{ gap: t.space[1] }}>
            {title ? (
              <Text variant="title2" accessibilityRole="header">
                {title}
              </Text>
            ) : null}
            {description ? (
              <Text variant="callout" tone="secondary">
                {description}
              </Text>
            ) : null}
          </View>
        ) : null}
        {children}
      </BottomSheetView>
    </BottomSheetModal>
  );
}
