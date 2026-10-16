import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { AppHeader } from '@/components/AppHeader';
import { Banner } from '@/components/Banner';
import { Button } from '@/components/Button';
import { DraftForm, type DraftValues } from '@/components/DraftForm';
import { colors, font } from '@/constants/theme';
import { useAppDispatch } from '@/store/hooks';
import { createTransaction } from '@/store/transactionsSlice';
import { parseBankSms, type SmsDraft } from '@/utils/sms';

const SAMPLE = 'Rs. 4,280.00 debited from A/C ending 1234 at KEELLS SUPER on 16/10/26. Bal Rs. 52,300.00';

export default function SmsReviewScreen() {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const [text, setText] = useState('');
  const [draft, setDraft] = useState<SmsDraft | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSave(v: DraftValues) {
    setBusy(true);
    try {
      await dispatch(createTransaction({ ...v, source: 'paste', note: 'From bank SMS' })).unwrap();
      navigation.goBack();
    } catch (e) {
      Alert.alert('Could not save', String((e as Error).message ?? e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <AppHeader title="Bank SMS" onBack={() => navigation.goBack()} />
          <Text style={styles.help}>Paste a bank message. FinSight reads it on this phone and drafts the transaction for you to confirm. Nothing is saved until you tap save.</Text>

          <TextInput
            value={text}
            onChangeText={(t) => {
              setText(t);
              setDraft(null);
            }}
            multiline
            placeholder={SAMPLE}
            placeholderTextColor={colors.caption}
            accessibilityLabel="Bank SMS text"
            style={styles.input}
            textAlignVertical="top"
          />

          <Button title="Read message" variant="tonal" icon="sparkle" disabled={!text.trim()} onPress={() => setDraft(parseBankSms(text))} />

          {draft ? (
            <>
              {draft.amountCents === null ? (
                <Banner tone="warning" title="Couldn't find an amount" message="Please type it in below." />
              ) : (
                <Banner tone="info" title="Check this draft" message="Parsed from your message. Fix anything that looks wrong." />
              )}
              <DraftForm
                initial={{ merchant: draft.merchant, amountCents: draft.amountCents, direction: draft.direction, category: draft.category }}
                submitLabel="Save transaction"
                busy={busy}
                onSubmit={onSave}
              />
            </>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16, gap: 14, paddingBottom: 48 },
  help: { fontFamily: font.medium, fontSize: 13, color: colors.ink2, lineHeight: 19 },
  input: {
    minHeight: 120,
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.line,
    padding: 14,
    fontFamily: font.medium,
    fontSize: 15,
    color: colors.ink,
  },
});