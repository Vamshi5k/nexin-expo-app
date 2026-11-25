import { StyleSheet, View } from 'react-native';

import { Image } from 'expo-image';
import { ArrowLeft, Heart, Share2, type LucideIcon } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { AppGlass, AppPressable } from '@/shared/components';

import CardGradient from './CardGradient';
import ChargerArt from './ChargerArt';

import { useTheme, type Theme } from '@/shared/theme';

import { DETAILS_COPY } from '../constants/stations.constants';

type DetailsHeroProps = {
  stationId: string;
  imageUrl: string | null;
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

export const heroHeight = (t: Theme) => t.space[12] * 4 + t.space[10];

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

// The station photo, or the brand charger drawing on the status colour when there is none.
const DetailsHero = ({
  stationId,
  imageUrl,
  statusColor,
  isFavourite,
  onBack,
  onShare,
  onToggleFavourite,
}: DetailsHeroProps) => {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const height = heroHeight(t);
  const fadeId = `hero-fade-${stationId}`;

  return (
    <View style={{ height, backgroundColor: t.colors.surfaceRaised }}>
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={t.motion.duration}
          accessibilityIgnoresInvertColors
        />
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.center]}>
          <CardGradient color={statusColor} id={`hero-${stationId}`} />
          <ChargerArt size={t.space[12] * 2 + t.space[10]} glow={statusColor} />
        </View>
      )}

      {/* Fade into the page so the info below reads as part of the same surface. */}
      <Svg style={[styles.fade, { height: t.space[12] }]} pointerEvents="none">
        <Defs>
          <LinearGradient id={fadeId} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={t.colors.bg} stopOpacity={0} />
            <Stop offset="1" stopColor={t.colors.bg} stopOpacity={1} />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${fadeId})`} />
      </Svg>

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
  fade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
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
