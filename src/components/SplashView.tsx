import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { colors, font } from '@/constants/theme';

/** Shown while the app reads its saved settings and checks who is signed in. */
export function SplashView() {
  return (
    <View style={styles.wrap} accessibilityLabel="Loading FinSight">
      <Text style={styles.brand}>FinSight</Text>
      <ActivityIndicator color="#FFFFFF" />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', gap: 16 },
  brand: { fontFamily: font.extrabold, fontSize: 34, color: '#FFFFFF' },
});