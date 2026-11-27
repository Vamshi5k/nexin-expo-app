import { useCallback, useEffect, useRef, type ReactNode } from 'react';
import { View } from 'react-native';

import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AppText from './AppText';

import { useTheme } from '@/shared/theme';

export type AppSheetProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children?: ReactNode;
  dismissible?: boolean;
};

const AppSheet = ({
  open,
  onClose,
  title,
  description,
  children,
  dismissible = true,
}: AppSheetProps) => {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const ref = useRef<BottomSheetModal>(null);

  // dismiss() on a sheet that never opened still fires onDismiss, which would close it again
  // right as it opens. Only a sheet we presented may dismiss or report back.
  const presented = useRef(false);

  const onDismiss = () => {
    if (!presented.current) return;
    presented.current = false;
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
      onDismiss={onDismiss}
      stackBehavior="push"
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
              <AppText variant="headline" accessibilityRole="header">
                {title}
              </AppText>
            ) : null}
            {description ? (
              <AppText variant="callout" tone="secondary">
                {description}
              </AppText>
            ) : null}
          </View>
        ) : null}
        {children}
      </BottomSheetView>
    </BottomSheetModal>
  );
};

export default AppSheet;
