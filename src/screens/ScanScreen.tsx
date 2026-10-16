import { useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { AppHeader } from '@/components/AppHeader';
import { Banner } from '@/components/Banner';
import { Button } from '@/components/Button';
import { DraftForm, type DraftValues } from '@/components/DraftForm';
import { colors, font } from '@/constants/theme';
import { useAppDispatch } from '@/store/hooks';
import { createTransaction } from '@/store/transactionsSlice';

export default function ScanScreen() {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function takePhoto() {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Camera permission needed', 'Allow camera access in Settings to photograph receipts.');
      return;
    }
    const res = await ImagePicker.launchCameraAsync({ quality: 0.6 });
    if (!res.canceled) setPhotoUri(res.assets[0].uri);
  }

  async function pickPhoto() {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.6 });
    if (!res.canceled) setPhotoUri(res.assets[0].uri);
  }

  async function onSave(v: DraftValues) {
    setBusy(true);
    try {
      await dispatch(createTransaction({ ...v, source: 'receipt', note: 'From receipt photo' })).unwrap();
      setPhotoUri(null);
      navigation.navigate('Tabs', { screen: 'Transactions' });
    } catch (e) {
      Alert.alert('Could not save', String((e as Error).message ?? e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <AppHeader title="Scan" subTitle="Add from a receipt or SMS" />

          {photoUri ? (
            <>
              <Image source={{ uri: photoUri }} style={styles.photo} accessibilityLabel="Receipt photo" resizeMode="cover" />
              <Banner tone="info" title="Enter what's on the receipt" message="Read the total from the photo above, then confirm. The photo is only a reference and stays on this phone." />
              <DraftForm initial={{ merchant: '', amountCents: null, direction: 'out', category: 'other' }} submitLabel="Save transaction" busy={busy} onSubmit={onSave} />
              <Button title="Retake photo" variant="outline" onPress={takePhoto} />
            </>
          ) : (
            <View style={styles.actions}>
              <Button title="Photograph a receipt" icon="scan" onPress={takePhoto} />
              <Button title="Choose from gallery" variant="outline" onPress={pickPhoto} />
              <Text style={styles.or}>or</Text>
              <Button title="Paste a bank SMS" variant="tonal" icon="pencil" onPress={() => navigation.navigate('SmsReview')} />
              <Text style={styles.note}>Receipts and SMS become drafts that you confirm before anything is saved.</Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: 16, paddingBottom: 48, gap: 14 },
  actions: { gap: 12, marginTop: 8 },
  or: { fontFamily: font.medium, fontSize: 13, color: colors.caption, textAlign: 'center' },
  note: { fontFamily: font.medium, fontSize: 12, color: colors.caption, textAlign: 'center' },
  photo: { width: '100%', height: 220, borderRadius: 16, backgroundColor: colors.line },
});