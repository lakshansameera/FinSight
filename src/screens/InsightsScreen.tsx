import { Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, type } from '@/constants/theme';

export default function InsightsScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg, padding: 16 }}>
      <Text style={type.headline}>Insights</Text>
    </SafeAreaView>
  );
}