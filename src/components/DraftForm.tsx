import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Button } from './Button';
import { CategoryPicker } from './CategoryPicker';
import { TextField } from './TextField';
import { colors, font, type CategoryKey } from '@/constants/theme';
import { centsToInput, parseAmountToCents } from '@/utils/currency';

export type DraftValues = {
  merchant: string;
  amountCents: number;
  direction: 'in' | 'out';
  category: CategoryKey;
};

type Props = Readonly<{
  initial: { merchant: string; amountCents: number | null; direction: 'in' | 'out'; category: CategoryKey };
  submitLabel: string;
  busy?: boolean;
  onSubmit: (v: DraftValues) => void;
}>;

const OUT_CATS: CategoryKey[] = ['food', 'transport', 'bills', 'shopping', 'health', 'loans', 'family', 'other'];
const IN_CATS: CategoryKey[] = ['income', 'family', 'other'];

/** Review-and-confirm form shared by the SMS and receipt flows. */
export function DraftForm({ initial, submitLabel, busy, onSubmit }: Props) {
  const [merchant, setMerchant] = useState(initial.merchant);
  const [amount, setAmount] = useState(initial.amountCents ? centsToInput(initial.amountCents) : '');
  const [direction, setDirection] = useState(initial.direction);
  const [category, setCategory] = useState(initial.category);
  const [touched, setTouched] = useState(false);

  // When a new draft arrives (e.g. a different SMS), reset the fields
  useEffect(() => {
    setMerchant(initial.merchant);
    setAmount(initial.amountCents ? centsToInput(initial.amountCents) : '');
    setDirection(initial.direction);
    setCategory(initial.category);
    setTouched(false);
  }, [initial.merchant, initial.amountCents, initial.direction, initial.category]);

  const cents = parseAmountToCents(amount);
  const errors = {
    merchant: merchant.trim() ? null : 'Who was this with?',
    amount: cents ? null : 'Enter an amount like 4280 or 4280.50',
  };

  function pickDirection(d: 'in' | 'out') {
    setDirection(d);
    const allowed = d === 'in' ? IN_CATS : OUT_CATS;
    if (!allowed.includes(category)) setCategory(d === 'in' ? 'income' : 'other');
  }

  function submit() {
    setTouched(true);
    if (errors.merchant || !cents) return;
    onSubmit({ merchant: merchant.trim(), amountCents: cents, direction, category });
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.seg} accessibilityRole="radiogroup">
        {(['out', 'in'] as const).map((d) => (
          <Pressable
            key={d}
            onPress={() => pickDirection(d)}
            accessibilityRole="radio"
            accessibilityState={{ selected: direction === d }}
            style={[styles.segItem, direction === d && styles.segOn]}
          >
            <Text style={[styles.segText, direction === d && styles.segTextOn]}>{d === 'out' ? 'Spent' : 'Received'}</Text>
          </Pressable>
        ))}
      </View>

      <TextField label="Merchant" value={merchant} onChangeText={setMerchant} placeholder="e.g. Keells Super" error={touched ? errors.merchant : null} />
      <TextField label="Amount" prefix="LKR" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" placeholder="0.00" error={touched ? errors.amount : null} />

      <Text style={styles.label}>Category</Text>
      <CategoryPicker options={direction === 'in' ? IN_CATS : OUT_CATS} value={category} onChange={setCategory} />

      <Button title={submitLabel} icon="check" onPress={submit} loading={busy} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 14 },
  label: { fontFamily: font.semibold, fontSize: 13, color: colors.ink2 },
  seg: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: 14, padding: 4 },
  segItem: { flex: 1, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  segOn: { backgroundColor: colors.primarySoft },
  segText: { fontFamily: font.semibold, fontSize: 14, color: colors.ink2 },
  segTextOn: { color: colors.primaryPressed, fontFamily: font.bold },
});