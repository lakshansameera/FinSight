import { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { AppHeader } from '@/components/AppHeader';
import { Banner } from '@/components/Banner';
import { Button } from '@/components/Button';
import { CategoryPicker } from '@/components/CategoryPicker';
import { TextField } from '@/components/TextField';
import { colors, font, type CategoryKey } from '@/constants/theme';
import type { RootStackParamList } from '@/navigation/types';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectBills } from '@/store/selectors';
import { createBill, editBill, payBill, removeBill } from '@/store/billsSlice';
import { billStatus, dueText } from '@/utils/bills';
import { centsToInput, formatLKR, parseAmountToCents } from '@/utils/currency';

const BILL_CATS: CategoryKey[] = ['bills', 'loans', 'family', 'health', 'transport', 'other'];
const REMIND_OPTIONS = [0, 1, 2, 3, 7];

/** billId === 'new' means "add a bill"; any other id means "view / edit this bill". */
export default function BillDetailScreen() {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { billId } = useRoute<RouteProp<RootStackParamList, 'BillDetail'>>().params;
  const isNew = billId === 'new';
  const bill = useAppSelector(selectBills).find((b) => b.id === billId);

  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDay, setDueDay] = useState('');
  const [category, setCategory] = useState<CategoryKey>('bills');
  const [remind, setRemind] = useState(2);
  const [busy, setBusy] = useState(false);
  const [touched, setTouched] = useState(false);

  // Fill the form once when editing an existing bill
  useEffect(() => {
    if (!bill) return;
    setName(bill.name);
    setAmount(centsToInput(bill.amountCents));
    setDueDay(String(bill.dueDay));
    setCategory(bill.category);
    setRemind(bill.remindDaysBefore);
  }, [bill?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const cents = parseAmountToCents(amount);
  const day = Number.parseInt(dueDay, 10);
  const errors = {
    name: name.trim() ? null : 'Give the bill a name',
    amount: cents ? null : 'Enter an amount like 4500 or 4500.50',
    dueDay: Number.isInteger(day) && day >= 1 && day <= 31 ? null : 'Enter a day from 1 to 31',
  };
  const valid = !errors.name && !errors.amount && !errors.dueDay;

  async function onSave() {
    setTouched(true);
    if (!valid || !cents) return;
    setBusy(true);
    try {
      const input = { name, amountCents: cents, dueDay: day, category, remindDaysBefore: remind };
      if (isNew) await dispatch(createBill(input)).unwrap();
      else await dispatch(editBill({ id: billId, changes: input })).unwrap();
      navigation.goBack();
    } catch (e) {
      Alert.alert('Could not save bill', String((e as Error).message ?? e));
    } finally {
      setBusy(false);
    }
  }

  function onDelete() {
    Alert.alert('Delete this bill?', 'Past payments stay in your transactions.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await dispatch(removeBill(billId));
          navigation.goBack();
        },
      },
    ]);
  }

  async function onPay() {
    try {
      await dispatch(payBill(billId)).unwrap();
    } catch (e) {
      Alert.alert('Could not mark as paid', String((e as Error).message ?? e));
    }
  }

  const live = bill ? billStatus(bill) : null;

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <AppHeader title={isNew ? 'New bill' : 'Bill details'} onBack={() => navigation.goBack()} />

          {!isNew && !bill ? (
            <Banner tone="warning" title="This bill no longer exists" />
          ) : (
            <>
              {live ? (
                <Banner
                  tone={live.status === 'paid' ? 'success' : live.status === 'overdue' ? 'danger' : live.status === 'dueSoon' ? 'warning' : 'info'}
                  title={dueText(live.status, live.daysLeft, live.dueDate)}
                  message={live.status === 'paid' ? `${formatLKR((bill?.amountCents ?? 0) / 100)} recorded as an expense.` : undefined}
                />
              ) : null}

              <TextField label="Bill name" value={name} onChangeText={setName} placeholder="e.g. CEB electricity" error={touched ? errors.name : null} />
              <TextField label="Amount" prefix="LKR" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" placeholder="0.00" error={touched ? errors.amount : null} />
              <TextField label="Due day of each month" value={dueDay} onChangeText={setDueDay} keyboardType="number-pad" maxLength={2} placeholder="25" error={touched ? errors.dueDay : null} />

              <Text style={styles.label}>Category</Text>
              <CategoryPicker options={BILL_CATS} value={category} onChange={setCategory} />

              <Text style={styles.label}>Remind me</Text>
              <View style={styles.chips}>
                {REMIND_OPTIONS.map((d) => (
                  <Pressable
                    key={d}
                    onPress={() => setRemind(d)}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: remind === d }}
                    style={[styles.chip, remind === d && styles.chipOn]}
                  >
                    <Text style={[styles.chipText, remind === d && styles.chipTextOn]}>
                      {d === 0 ? 'On the day' : `${d} day${d === 1 ? '' : 's'} before`}
                    </Text>
                  </Pressable>
                ))}
              </View>
              <Text style={styles.hint}>Reminders are scheduled on this phone at 9:00, so they work offline.</Text>

              <View style={styles.actions}>
                <Button title={isNew ? 'Add bill' : 'Save changes'} icon="check" onPress={onSave} loading={busy} />
                {!isNew && live && live.status !== 'paid' ? (
                  <Button title="Mark as paid" variant="tonal" icon="check" onPress={onPay} />
                ) : null}
                {!isNew ? <Button title="Delete bill" variant="danger" onPress={onDelete} /> : null}
              </View>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16, gap: 14, paddingBottom: 48 },
  label: { fontFamily: font.semibold, fontSize: 13, color: colors.ink2 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 12, height: 36, borderRadius: 999, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: 'transparent' },
  chipOn: { backgroundColor: colors.primarySoft, borderColor: colors.primary },
  chipText: { fontFamily: font.medium, fontSize: 13, color: colors.ink2 },
  chipTextOn: { fontFamily: font.bold, color: colors.primaryPressed },
  hint: { fontFamily: font.medium, fontSize: 12, color: colors.caption },
  actions: { gap: 10, marginTop: 8 },
});