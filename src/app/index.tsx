import { StyleSheet, Text, View } from 'react-native';

import { APP_ENV, brand } from '@/core/config';

export default function Index() {
  return (
    <View style={[styles.container, { backgroundColor: brand.colors.background }]}>
      <Text style={[styles.title, { color: brand.colors.primary }]}>
        Hello {brand.appName} ({APP_ENV})
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
  },
});
