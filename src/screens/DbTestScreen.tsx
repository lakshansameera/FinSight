import { Alert, FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { AppHeader } from '@/components/AppHeader';
import { Button } from '@/components/Button';
import { Banner } from '@/components/Banner';
import { BudgetBar } from '@/components/BudgetBar';
import { ExpenseItem } from '@/components/ExpenseItem';
import { colors, font } from '@/constants/theme';
import { CATEGORY_LABELS } from '@/constants/categories';
import type { Transaction } from '@/db/transactionsRepo';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectBudgets, selectSync, selectTransactions } from '@/store/selectors';
import { createTransaction, removeTransaction } from '@/store/transactionsSlice';
import { saveBudget } from '@/store/budgetsSlice';

const SAMPLES = [
  { merchant: 'Keells Super', category: 'food', amountCents: 428000 },
  { merchant: 'PickMe', category: 'transport', amountCents: 64000 },
  { merchant: 'Dialog Axiata', category: 'bills', amountCents: 299000 },
  { merchant: 'Osu Sala', category: 'health', amountCents: 185050 },
] as const;

// Same test screen as Phase 4 — but now it only READS from the store and DISPATCHES actions.
// It no longer talks to SQLite itself.
export default function DbTestScreen() {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();

  const items = useAppSelector(selectTransactions);
  const budgets = useAppSelector(selectBudgets);
  const sync = useAppSelector(selectSync);
  const error = useAppSelector((s) => s.transactions.error ?? s.budgets.error);

  function onAdd() {
    const s = SAMPLES[Math.floor(Math.random() * SAMPLES.length)];
    dispatch(createTransaction({ ...s, direction: 'out' }));
  }

  function onSetBudgets() {
    dispatch(saveBudget({ category: 'food', limitCents: 2500000 }));
    dispatch(saveBudget({ category: 'transport', limitCents: 1000000 }));
    dispatch(saveBudget({ category: 'bills', limitCents: 800000 }));
  }

  function onRowPress(t: Transaction) {
    Alert.alert(t.merchant, 'What do you want to test?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Open in form', onPress: () => navigation.navigate('TransactionForm', { transactionId: t.id }) },
      { text: 'Delete', style: 'destructive', onPress: () => dispatch(removeTransaction(t.id)) },
    ]);
  }
  return (
    <SafeAreaView style={styles.screen}>
      <AppHeader title="Database test" onBack={() => navigation.goBack()} syncState={sync.status} pendingCount={sync.pendingCount} />
      {error ? <Banner tone="danger" title="Database error" message={error} /> : null}

      <FlatList
        data={items}
        keyExtractor={(t) => t.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.row}>
              <Button title="Add random" icon="plus" size="md" onPress={onAdd} />
              <Button title="Set test budgets" variant="tonal" size="md" onPress={onSetBudgets} />
            </View>

            {budgets.map((b) => (
              <BudgetBar
                key={b.id}
                label={CATEGORY_LABELS[b.category]}
                cat={b.category}
                spent={b.spentCents / 100}
                limit={b.limitCents / 100}
              />
            ))}

            <Text style={styles.count}>
              {items.length} saved · {sync.pendingCount} in sync queue · tap a row to edit or delete
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <ExpenseItem
            merchant={item.merchant}
            meta={`${CATEGORY_LABELS[item.category]} · ${new Date(item.occurredAt).toLocaleString()}`}
            amount={item.amountCents / 100}
            cat={item.category}
            direction={item.direction}
            tag={item.syncStatus === 'pending' ? 'pending' : undefined}
            onPress={() => onRowPress(item)}
          />
        )}
        ListEmptyComponent={<Text style={styles.count}>No transactions yet. Tap "Add random".</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: 16 },
  header: { gap: 12, marginBottom: 4 },
  row: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  count: { fontFamily: font.medium, color: colors.caption, fontSize: 13 },
  list: { gap: 8, paddingBottom: 40 },
});