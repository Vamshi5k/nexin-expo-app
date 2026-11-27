import { useContext } from 'react';
import { RefreshControl, StyleSheet, View } from 'react-native';

import { BottomTabBarHeightContext } from 'expo-router/tabs';
import { Wallet } from 'lucide-react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppEmptyState, AppErrorState, AppFade, AppPressable, AppText } from '@/shared/components';

import BalanceCard from '../components/BalanceCard';
import TransactionList, { TransactionSkeleton } from '../components/TransactionList';

import { useTheme } from '@/shared/theme';

import { riseIn } from '@/shared/utils/motion';

import { WALLET_COPY } from '../constants/wallet.constants';
import { useWallet } from '../hooks/useWallet';

const SKELETON_ROWS = 4;

// Wallet tab (BLUEPRINT D1): title, the balance card with Add Money, then recent transactions.
const WalletScreen = () => {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useContext(BottomTabBarHeightContext) ?? 0;
  const wallet = useWallet();

  const transactions = (() => {
    if (wallet.state === 'loading') return <TransactionSkeleton rows={SKELETON_ROWS} />;
    if (wallet.state === 'error') {
      return (
        <AppErrorState
          title={WALLET_COPY.transactions}
          message={WALLET_COPY.loadError}
          onRetry={wallet.retry}
          retryLabel={WALLET_COPY.retry}
        />
      );
    }
    if (wallet.state === 'empty') {
      return (
        <AppEmptyState
          icon={Wallet}
          title={WALLET_COPY.emptyTitle}
          description={WALLET_COPY.emptyBody}
        />
      );
    }
    return <TransactionList transactions={wallet.transactions} stagger={3} />;
  })();

  return (
    <View style={[styles.screen, { backgroundColor: t.colors.bg }]}>
      <View pointerEvents="none" style={[styles.wash, { height: insets.top + t.space[12] * 4 }]}>
        <AppFade id="wallet-wash" color={t.colors.accent} from={0.22} to={0} top />
      </View>
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          gap: t.space[5],
          paddingTop: insets.top + t.space[2],
          paddingHorizontal: t.layout.screenPadding,
          paddingBottom: tabBarHeight + t.space[6],
        }}
        refreshControl={
          <RefreshControl
            refreshing={wallet.refreshing}
            onRefresh={() => void wallet.refresh()}
            tintColor={t.colors.accentText}
            progressViewOffset={insets.top}
          />
        }
      >
        <Animated.View entering={riseIn(0)} style={{ gap: t.space[1] / 2 }}>
          <AppText variant="title2" accessibilityRole="header">
            {WALLET_COPY.title}
          </AppText>
          <AppText variant="caption" tone="secondary">
            {WALLET_COPY.subtitle}
          </AppText>
        </Animated.View>

        <Animated.View entering={riseIn(1)}>
          <BalanceCard
            balancePaise={wallet.balancePaise}
            hidden={wallet.hidden}
            onToggleHidden={wallet.toggleHidden}
            onAddMoney={wallet.addMoney}
          />
        </Animated.View>

        <Animated.View entering={riseIn(2)} style={{ gap: t.space[3] }}>
          <View style={styles.row}>
            <AppText variant="headline" accessibilityRole="header" style={styles.grow}>
              {WALLET_COPY.transactions}
            </AppText>
            {wallet.state === 'ready' ? (
              <AppPressable
                onPress={wallet.seeAll}
                feedback="opacity"
                hitSlop={t.space[2]}
                accessibilityRole="link"
                accessibilityLabel={WALLET_COPY.seeAll}
              >
                <AppText variant="subhead" tone="accent">
                  {WALLET_COPY.seeAll}
                </AppText>
              </AppPressable>
            ) : null}
          </View>
          {transactions}
        </Animated.View>
      </Animated.ScrollView>
    </View>
  );
};

export default WalletScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  wash: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  grow: {
    flex: 1,
  },
});
