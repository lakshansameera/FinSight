import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Button } from './Button';
import { CategoryPicker } from './CategoryPicker';
import { TextField } from './TextField';
import { colors, font, type CategoryKey } from '@/constants/theme';
import { CATEGORY_LABELS } from '@/constants/categories';
import { centsToInput, parseAmountToCents } from '@/utils/currency';

type Props = Readonly<{
  visible: boolean;
  
  editing: { id: string; category: CategoryKey; limitCents: number } | null;
  availableCats: CategoryKey[]; // categories that don't have a budget yet
  onSave: (category: CategoryKey, limitCents: number) => void;
  onRemove: (id: string) => void;
  onClose: () => void;
}>;


export function BudgetEditor({ visible, editing, availableCats, onSave, onRemove, onClose }: Props) {
  const [cat, setCat] = useState<CategoryKey | null>(null);
  const [amountText, setAmountText] = useState('');
  const [submitted, setSubmitted] = useState(false);


  useEffect(() => {
    if (visible) {
      setCat(editing?.category ?? null);
      setAmountText(editing ? centsToInput(editing.limitCents) : '');
      setSubmitted(false);
    }
  }, [visible, editing]);

  const cents = parseAmountToCents(amountText);
  const amountError = cents === null ? 'Enter a monthly limit, like 25000' : null;
  const catError = cat === null ? 'Pick a category' : null;

  function save() {
    setSubmitted(true);
    if (cents === null || cat === null) return;
    onSave(cat, cents);
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      {/* Dark backdrop: tap it to close */}
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close" />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.title}>
            {editing ? `${CATEGORY_LABELS[editing.category]} budget` : 'New monthly budget'}
          </Text>

          {!editing ? (
            availableCats.length > 0 ? (
              <View style={styles.block}>
                <Text style={styles.label}>Category</Text>
                <CategoryPicker options={availableCats} value={cat} onChange={setCat} />
                {submitted && catError ? <Text style={styles.error}>{catError}</Text> : null}
              </View>
            ) : (
              <Text style={styles.note}>Every category already has a budget.</Text>
            )
          ) : null}

          <TextField
            label="Monthly limit"
            prefix="LKR"
            value={amountText}
            onChangeText={setAmountText}
            keyboardType="decimal-pad"
            placeholder="0"
            error={submitted ? amountError : null}
          />

          <Button title={editing ? 'Save changes' : 'Add budget'} icon="check" onPress={save} />
          {editing ? (
            <Button title="Remove budget" variant="danger" onPress={() => onRemove(editing.id)} />
          ) : null}
          <Button title="Cancel" variant="outline" onPress={onClose} />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(20, 32, 26, 0.45)' },
  sheet: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 16,
    paddingBottom: 32,
    gap: 14,
  },
  handle: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: colors.line },
  title: { fontFamily: font.bold, fontSize: 18, color: colors.ink },
  block: { gap: 8 },
  label: { fontFamily: font.semibold, fontSize: 13, color: colors.ink2 },
  note: { fontFamily: font.medium, fontSize: 13, color: colors.caption },
  error: { fontFamily: font.medium, fontSize: 12, color: colors.danger },
});