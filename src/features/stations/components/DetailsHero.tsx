import type { ComponentType } from 'react';
import { StyleSheet, View } from 'react-native';

import { ArrowLeft, Heart, Share2, type LucideIcon } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppGlass, AppPressable } from '@/shared/components';

import CardGradient from './CardGradient';
import ChargerArt from './ChargerArt';
import type { DetailsMapProps } from './DetailsMap';

import { useTheme, type Theme } from '@/shared/theme';

import { mapsSupport } from '@/core/maps';

import { DETAILS_COPY } from '../constants/stations.constants';
import type { StationDetails } from '../types/stations.types';

type DetailsHeroProps = {
  station: StationDetails;
  statusColor: string;
  isFavourite: boolean;
  onBack: () => void;
  onShare: () => void;
  onToggleFavourite: () => void;
};

type GlassButtonProps = {
  icon: LucideIcon;
  label: string;
  onPress: () => void;
  active?: boolean;
};

// Loaded only when the native maps module exists, like the map screen.
const DetailsMap: ComponentType<DetailsMapProps> | null =
  mapsSupport === 'ready'
    ? // eslint-disable-next-line @typescript-eslint/no-require-imports
      (require('./DetailsMap') as typeof import('./DetailsMap')).default
    : null;

export const heroHeight = (t: Theme) => t.space[12] * 6;
// The sheet slides up over the hero by this much.
export const sheetOverlap = (t: Theme) => t.space[8];

const GlassButton = ({ icon: Icon, label, onPress, active }: GlassButtonProps) => {
  const t = useTheme();
  const color = active ? t.colors.danger : t.colors.textPrimary;

  return (
    <AppGlass radius={t.radius.pill}>
      <AppPressable
        onPress={onPress}
        haptic="light"
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={active === undefined ? undefined : { selected: active }}
        style={[styles.center, { width: t.layout.minTouch, height: t.layout.minTouch }]}
      >
        <Icon
          color={color}
          fill={active ? color : 'transparent'}
          size={t.icon.control}
          strokeWidth={t.icon.stroke}
        />
      </AppPressable>
    </AppGlass>
  );
};

// Uber-style top: a still map of the station, or the brand charger art when maps are missing.
const DetailsHero = ({
  station,
  statusColor,
  isFavourite,
  onBack,
  onShare,
  onToggleFavourite,
}: DetailsHeroProps) => {
  const t = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={{ height: heroHeight(t), backgroundColor: t.colors.surfaceSunken }}>
      {DetailsMap ? (
        <DetailsMap station={station} />
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.center]}>
          <CardGradient color={statusColor} id={`hero-${station.id}`} />
          <ChargerArt size={t.space[12] * 2 + t.space[10]} glow={statusColor} />
        </View>
      )}

      <View
        style={[
          styles.bar,
          { top: insets.top + t.space[2], paddingHorizontal: t.space[4], gap: t.space[2] },
        ]}
      >
        <GlassButton icon={ArrowLeft} label={DETAILS_COPY.back} onPress={onBack} />
        <View style={styles.grow} />
        <GlassButton icon={Share2} label={DETAILS_COPY.share} onPress={onShare} />
        <GlassButton
          icon={Heart}
          label={isFavourite ? DETAILS_COPY.removeFavourite : DETAILS_COPY.addFavourite}
          onPress={onToggleFavourite}
          active={isFavourite}
        />
      </View>
    </View>
  );
};

export default DetailsHero;

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },
  grow: {
    flex: 1,
  },
});
