import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { AppHeader } from '@/components/AppHeader';
import { Button } from '@/components/Button';
import { CategoryPicker } from '@/components/CategoryPicker';
import { TextField } from '@/components/TextField';
import { colors, font, type CategoryKey } from '@/constants/theme';
import type { RootStackParamList } from '@/navigation/types';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { createTransaction, editTransaction, removeTransaction } from '@/store/transactionsSlice';
import { centsToInput, parseAmountToCents } from '@/utils/currency';

const SPEND_CATS : CategoryKey[] = ['food','transport', 'bills', 'shopping', 'health', 'loans', 'family', 'other'];
const DAY_OPTIONS = [
  { label: 'Today', daysAgo: 0 },
  { label: 'Yesterday', daysAgo: 1 },
  { label: '2 days ago', daysAgo: 2 },
];

function daysAgoISO(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

function daysAgoOf(iso: string) {
  const a = new Date(iso);
  const b = new Date();
  a.setHours(0, 0, 0, 0);
  b.setHours(0, 0, 0, 0);
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

export default function TransactionFormScreen() {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const route = useRoute<RouteProp<RootStackParamList, 'TransactionForm'>>();

  const editId = route.params ?.transactionId;
  const existing = useAppSelector((s) => s.transactions.items.find((t) => t.id === editId ));
  const isEdit = Boolean(existing);

  const [direction, setDirection] = useState<'out' | 'in'>(existing?.direction ?? 'out');
  const [amountText, setAmountText] = useState(existing ? centsToInput(existing.amountCents) : '');
  const [merchant, setMerchant] = useState(existing?.merchant ?? '');
  const [cat, setCat] = useState<CategoryKey | null>(existing?.category ?? null);
  const [daysAgo, setDaysAgo] = useState(existing ? daysAgoOf(existing.occurredAt) : 0);
  const [note, setNote] = useState(existing?.note ?? '');
  const [submitted, setSubmitted] = useState(false); 
  const [saving, setSaving] = useState(false);

  const amountCents = parseAmountToCents(amountText);
  const finalCat: CategoryKey | null = direction === 'in' ? 'income' : cat;
  const errors = {
    amount: amountCents === null ? 'Enter an amount, like 1500 or 1,250.50' : null,
    merchant: merchant.trim().length === 0 ? (direction === 'in' ? 'Who paid you?' : 'Where did you spend it?') : null,
    category: finalCat === null ? 'Pick a category' : null,
  };
  const isValid = !errors.amount && !errors.merchant && !errors.category;

  async function onSave(){
    setSubmitted(true);
    if ( !isValid || amountCents === null || finalCat === null) return;

    const occuredAt = existing && daysAgo  === daysAgoOf(existing.occurredAt) ? existing.occurredAt:  daysAgoISO(daysAgo);
    const data = { amountCents, direction, category: finalCat, merchant, note, occuredAt };

    setSaving(true);

    try{
      if(existing){
        await dispatch(editTransaction({ id: existing.id, changes: data })).unwrap();
      }
      navigation.goBack();
    }
    catch(e){
      Alert.alert('Could not save', String((e as Error).message ?? e));
      setSaving(false);
    }
  }

  function onDelete() {
    if (!existing) return;
    Alert.alert('Delete this transaction?', `${existing.merchant} will be removed.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await dispatch(removeTransaction(existing.id));
          navigation.goBack();
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.pad}>
        <AppHeader title={isEdit ? 'Edit transaction' : 'Add transaction'} onBack={() => navigation.goBack()} />
      </View>
<KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {/* Spent / Received toggle */}
          <View style={styles.segment} accessibilityRole="radiogroup">
            {(['out', 'in'] as const).map((d) => {
              const active = direction === d;
              return (
                <Pressable
                  key={d}
                  onPress={() => setDirection(d)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: active }}
                  style={[styles.segmentItem, active && styles.segmentActive]}
                >
                  <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
                    {d === 'out' ? 'Money spent' : 'Money received'}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <TextField
            label="Amount"
            prefix="LKR"
            value={amountText}
            onChangeText={setAmountText}
            keyboardType="decimal-pad"
            placeholder="0"
            autoFocus={!isEdit}
            style={styles.amountInput}
            error={submitted ? errors.amount : null}
          />

          <TextField
            label={direction === 'in' ? 'From' : 'Merchant'}
            value={merchant}
            onChangeText={setMerchant}
            placeholder={direction === 'in' ? 'e.g. ABC Pvt Ltd' : 'e.g. Keells Super'}
            autoCapitalize="words"
            returnKeyType="next"
            error={submitted ? errors.merchant : null}
          />

          {direction === 'out' ? (
            <View style={styles.block}>
              <Text style={styles.label}>Category</Text>
              <CategoryPicker options={SPEND_CATS} value={cat} onChange={setCat} />
              {submitted && errors.category ? <Text style={styles.error}>{errors.category}</Text> : null}
            </View>
          ) : null}

          <View style={styles.block}>
            <Text style={styles.label}>When</Text>
            <View style={styles.chips}>
              {DAY_OPTIONS.map((o) => {
                const active = daysAgo === o.daysAgo;
                return (
                  <Pressable
                    key={o.label}
                    onPress={() => setDaysAgo(o.daysAgo)}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: active }}
                    style={[styles.chip, active && styles.chipActive]}
                  >
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>{o.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <TextField
            label="Note (optional)"
            value={note}
            onChangeText={setNote}
            placeholder="Anything to remember"
            multiline
          />

          <Button title={isEdit ? 'Save changes' : 'Save transaction'} icon="check" loading={saving} onPress={onSave} />
          {isEdit ? <Button title="Delete transaction" variant="danger" onPress={onDelete} /> : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );


}


const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  pad: { paddingHorizontal: 16 },
  content: { padding: 16, gap: 18, paddingBottom: 40 },
  block: { gap: 8 },
  label: { fontFamily: font.semibold, fontSize: 13, color: colors.ink2 },
  error: { fontFamily: font.medium, fontSize: 12, color: colors.danger },
  amountInput: { fontFamily: font.bold, fontSize: 24 },
  segment: { flexDirection: 'row', backgroundColor: colors.line, borderRadius: 14, padding: 4 },
  segmentItem: { flex: 1, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  segmentActive: { backgroundColor: colors.surface },
  segmentText: { fontFamily: font.semibold, fontSize: 14, color: colors.caption },
  segmentTextActive: { color: colors.ink },
  chips: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  chip: {
    paddingHorizontal: 14,
    height: 36,
    borderRadius: 999,
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.line,
  },
  chipActive: { backgroundColor: colors.primarySoft, borderColor: colors.primary },
  chipText: { fontFamily: font.semibold, fontSize: 13, color: colors.ink2 },
  chipTextActive: { color: colors.primaryPressed },
});