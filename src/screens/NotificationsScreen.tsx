import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { AppHeader } from '@/components/AppHeader';
import { Banner } from '@/components/Banner';
import { colors, font } from '@/constants/theme';
import { useAppSelector } from '@/store/hooks';
import { selectNotifications, type AppNotification } from '@/store/selectors';

export default function NotificationsScreen() {
  const navigation = useNavigation();
  const items = useAppSelector(selectNotifications);

  function open(n: AppNotification) {
    if (n.target.screen === 'BillDetail') navigation.navigate('BillDetail', { billId: n.target.billId });
    else navigation.navigate('Budgets');
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.pad}>
        <AppHeader title="Notifications" onBack={() => navigation.goBack()} />
      </View>
      <FlatList
        data={items}
        keyExtractor={(n) => n.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Banner
            tone={item.tone}
            title={item.title}
            message={item.message}
            actionLabel={item.target.screen === 'Budgets' ? 'View budgets' : 'Open bill'}
            onAction={() => open(item)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>You're all caught up</Text>
            <Text style={styles.emptyText}>Bill reminders and budget warnings will show up here.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  pad: { paddingHorizontal: 16 },
  list: { padding: 16, gap: 10, paddingBottom: 40 },
  empty: { alignItems: 'center', paddingVertical: 48, paddingHorizontal: 24, gap: 6 },
  emptyTitle: { fontFamily: font.bold, fontSize: 16, color: colors.ink },
  emptyText: { fontFamily: font.medium, fontSize: 13, color: colors.caption, textAlign: 'center' },
});