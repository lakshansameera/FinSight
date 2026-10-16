import { useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { AppHeader } from '@/components/AppHeader';
import { BudgetBar } from '@/components/BudgetBar';
import { BudgetEditor } from '@/components/BudgetEditor';
import { Button } from '@/components/Button';
import { colors, font, type CategoryKey } from '@/constants/theme';
import { CATEGORY_LABELS } from '@/constants/categories';
import type { BudgetWithSpent } from '@/db/budgetsRepo';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectBudgetSummary, selectBudgets } from '@/store/selectors';
import { removeBudget, saveBudget } from '@/store/budgetsSlice';
import { formatLKR } from '@/utils/currency';

// Spending categories that can have a budget (income can't)
const BUDGETABLE: CategoryKey[] = ['food', 'transport', 'bills', 'shopping', 'health', 'loans', 'family', 'other'];

export default function BudgetsScreen() {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const budgets = useAppSelector(selectBudgets);
  const summary = useAppSelector(selectBudgetSummary);

  // Which sheet is open: closed / adding / editing one budget
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<BudgetWithSpent | null>(null);

  // Categories without a budget yet (only these can be added)
  const availableCats = useMemo(
    () => BUDGETABLE.filter((c) => !budgets.some((b) => b.category === c)),
    [budgets],
  );

  const openAdd = () => {
    setEditing(null);
    setSheetOpen(true);
  };
  const openEdit = (b: BudgetWithSpent) => {
    setEditing(b);
    setSheetOpen(true);
  };
  const close = () => setSheetOpen(false);

  async function onSave(category: CategoryKey, limitCents: number) {
    try {
      await dispatch(saveBudget({ category, limitCents })).unwrap();
      close();
    } catch (e) {
      Alert.alert('Could not save budget', String((e as Error).message ?? e));
    }
  }

  function onRemove(id: string) {
    Alert.alert('Remove this budget?', 'Your transactions stay. Only the limit is removed.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          await dispatch(removeBudget(id));
          close();
        },
      },
    ]);
  }

  const left = summary.limitCents - summary.spentCents;

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.pad}>
        <AppHeader title="Budgets" onBack={() => navigation.goBack()} />
      </View>

      <FlatList
        data={budgets}
        keyExtractor={(b) => b.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          budgets.length > 0 ? (
            <View style={styles.summary}>
              <Text style={styles.sumLabel}>This month</Text>
              <Text style={styles.sumBig}>
                {formatLKR(summary.spentCents / 100)}
                <Text style={styles.sumOf}> of {formatLKR(summary.limitCents / 100)}</Text>
              </Text>
              <Text style={[styles.sumLeft, left < 0 && styles.sumOver]}>
                {left >= 0 ? `${formatLKR(left / 100)} left across ${budgets.length} budgets` : `Over by ${formatLKR(-left / 100)}`}
              </Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => openEdit(item)}
            accessibilityRole="button"
            accessibilityHint="Opens the budget editor"
            style={({ pressed }) => pressed && styles.pressed}
          >
            <BudgetBar
              label={CATEGORY_LABELS[item.category]}
              cat={item.category}
              spent={item.spentCents / 100}
              limit={item.limitCents / 100}
            />
          </Pressable>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No budgets yet</Text>
            <Text style={styles.emptyText}>
              Set a monthly limit for a category and FinSight will warn you at 80%.
            </Text>
          </View>
        }
        ListFooterComponent={
          availableCats.length > 0 ? <Button title="Add budget" icon="plus" variant="tonal" onPress={openAdd} /> : null
        }
      />

      <BudgetEditor
        visible={sheetOpen}
        editing={editing}
        availableCats={availableCats}
        onSave={onSave}
        onRemove={onRemove}
        onClose={close}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  pad: { paddingHorizontal: 16 },
  list: { padding: 16, gap: 10, paddingBottom: 40 },
  pressed: { opacity: 0.7 },
  summary: { backgroundColor: colors.surface, borderRadius: 20, padding: 16, gap: 4, marginBottom: 6 },
  sumLabel: { fontFamily: font.medium, fontSize: 12, color: colors.caption },
  sumBig: { fontFamily: font.extrabold, fontSize: 22, color: colors.ink, fontVariant: ['tabular-nums'] },
  sumOf: { fontFamily: font.semibold, fontSize: 15, color: colors.caption },
  sumLeft: { fontFamily: font.semibold, fontSize: 13, color: colors.success },
  sumOver: { color: colors.danger },
  empty: { alignItems: 'center', paddingVertical: 48, paddingHorizontal: 24, gap: 6 },
  emptyTitle: { fontFamily: font.bold, fontSize: 16, color: colors.ink },
  emptyText: { fontFamily: font.medium, fontSize: 13, color: colors.caption, textAlign: 'center' },
});