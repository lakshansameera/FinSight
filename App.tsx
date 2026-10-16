import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from '@/navigation/RootNavigator';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
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
import { Provider } from 'react-redux';
import { store } from '@/store';
import { loadTransactions } from '@/store/transactionsSlice';
import { loadBudgets } from '@/store/budgetsSlice';
import { refreshPending } from '@/store/syncSlice';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { loadBills } from '@/store/billsSlice';
import { bootstrapAuth } from '@/store/authSlice';
import { SyncManager } from '@/components/SyncManager';

SplashScreen.preventAutoHideAsync();

export default function App() {

  //loading fonts
  const [loaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
    ...Ionicons.font,
    ...MaterialCommunityIcons.font,
  });

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

    useEffect(() => {
    store.dispatch(loadTransactions());
    store.dispatch(loadBudgets());
    store.dispatch(loadBills());
    store.dispatch(refreshPending());
    store.dispatch(bootstrapAuth());
  }, []);

  if (!loaded) return null;

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <RootNavigator />
        <SyncManager />
        <StatusBar style="dark" />
      </SafeAreaProvider>
    </Provider>
  );
}
