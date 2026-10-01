import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { 
  useFonts,
  Inter_400Regular, 
  Inter_500Medium, 
  Inter_600SemiBold, 
  Inter_700Bold,
  Inter_800ExtraBold 
} from '@expo-google-fonts/inter';
import { colors, type } from '@/constants/theme';

SplashScreen.preventAutoHideAsync();

export default function App() {

  //loading fonts
  const [loaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  });

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, justifyContent: 'center', padding: 24, gap: 8 }}>
      <Text style={[type.display, { color: colors.primary }]}>FinSight</Text>
      <Text style={type.body}>Your money stays useful offline.</Text>
      <Text style={type.caption}>Theme and fonts loaded</Text>
      <StatusBar style="dark" />
    </View>
  );
}
