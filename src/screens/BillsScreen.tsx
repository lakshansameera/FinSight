import { Alert, FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { AppHeader } from '@/components/AppHeader';
import { BillCard } from '@/components/BillCard';
import { Button } from '@/components/Button';
import { colors, font } from '@/constants/theme';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectBillsSummary, selectBillsWithStatus, selectSync } from '@/store/selectors';
import { payBill } from '@/store/billsSlice';
import { dueText } from '@/utils/bills';
import { formatLKR } from '@/utils/currency';

export default function BillsScreen() {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectBillsWithStatus);
  const summary = useAppSelector(selectBillsSummary);
  const sync = useAppSelector(selectSync);

  async function onPay(id: string, name: string) {
    try {
      await dispatch(payBill(id)).unwrap();
    } catch (e) {
      Alert.alert(`Could not mark ${name} as paid`, String((e as Error).message ?? e));
    }
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.pad}>
        <AppHeader title="Bills & recurring" onBack={() => navigation.goBack()} syncState={sync.status} pendingCount={sync.pendingCount} />
      </View>

      <FlatList
        data={items}
        keyExtractor={(i) => i.bill.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          summary.count > 0 ? (
            <View style={styles.summary}>
              <Text style={styles.sumLabel}>Still to pay this month</Text>
              <Text style={styles.sumBig}>{formatLKR(summary.remainingCents / 100)}</Text>
              <Text style={styles.sumSmall}>
                {formatLKR(summary.paidCents / 100)} paid
                {summary.attention > 0 ? ` · ${summary.attention} need attention` : ''}
              </Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <BillCard
            name={item.bill.name}
            cat={item.bill.category}
            amount={item.bill.amountCents / 100}
            status={item.status}
            dueText={dueText(item.status, item.daysLeft, item.dueDate)}
            onPress={() => navigation.navigate('BillDetail', { billId: item.bill.id })}
            onMarkPaid={() => onPay(item.bill.id, item.bill.name)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No bills yet</Text>
            <Text style={styles.emptyText}>Add rent, electricity or subscriptions and FinSight will remind you before they're due.</Text>
          </View>
        }
        ListFooterComponent={
          <View style={styles.footer}>
            <Button title="Add bill" icon="plus" variant="tonal" onPress={() => navigation.navigate('BillDetail', { billId: 'new' })} />
            <Button title="Paste a bank SMS" icon="pencil" variant="outline" onPress={() => navigation.navigate('SmsReview')} />
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
  summary: { backgroundColor: colors.surface, borderRadius: 20, padding: 16, gap: 4, marginBottom: 6 },
  sumLabel: { fontFamily: font.medium, fontSize: 12, color: colors.caption },
  sumBig: { fontFamily: font.extrabold, fontSize: 22, color: colors.ink, fontVariant: ['tabular-nums'] },
  sumSmall: { fontFamily: font.semibold, fontSize: 13, color: colors.ink2 },
  empty: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 24, gap: 6 },
  emptyTitle: { fontFamily: font.bold, fontSize: 16, color: colors.ink },
  emptyText: { fontFamily: font.medium, fontSize: 13, color: colors.caption, textAlign: 'center' },
  footer: { gap: 10, marginTop: 6 },
});