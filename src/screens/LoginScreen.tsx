import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Banner } from '@/components/Banner';
import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import { colors, font } from '@/constants/theme';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { clearAuthError, continueOffline, register, signIn } from '@/store/authSlice';

export default function LoginScreen() {
  const dispatch = useAppDispatch();
  const { busy, error } = useAppSelector((s) => s.auth);
  const [creating, setCreating] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState(false);

  const errors = {
    email: /^\S+@\S+\.\S+$/.test(email.trim()) ? null : 'Enter a valid email address',
    password: password.length >= 6 ? null : 'Use at least 6 characters',
  };

  function submit() {
    setTouched(true);
    if (errors.email || errors.password) return;
    dispatch(creating ? register({ email, password }) : signIn({ email, password }));
  }

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.head}>
            <Text style={styles.brand}>FinSight</Text>
            <Text style={styles.title}>{creating ? 'Create your account' : 'Welcome back'}</Text>
            <Text style={styles.sub}>Sign in to back up your data and use it on another phone.</Text>
          </View>

          {error ? <Banner tone="danger" title="Could not continue" message={error} onDismiss={() => dispatch(clearAuthError())} /> : null}

          <TextField
            label="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            placeholder="you@example.com"
            error={touched ? errors.email : null}
          />
          <TextField
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoComplete={creating ? 'new-password' : 'current-password'}
            placeholder="At least 6 characters"
            error={touched ? errors.password : null}
          />

          <Button title={creating ? 'Create account' : 'Sign in'} onPress={submit} loading={busy} />
          <Button
            title={creating ? 'I already have an account' : 'Create a new account'}
            variant="tonal"
            onPress={() => {
              setCreating(!creating);
              dispatch(clearAuthError());
            }}
          />

          <Text style={styles.or}>or</Text>
          <Button title="Continue without an account" variant="outline" onPress={() => dispatch(continueOffline())} />
          <Text style={styles.note}>Without an account your data stays only on this phone. You can sign in later and it will be backed up.</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 24, gap: 14, paddingBottom: 48 },
  head: { gap: 6, marginBottom: 8, marginTop: 8 },
  brand: { fontFamily: font.extrabold, fontSize: 16, color: colors.primary },
  title: { fontFamily: font.extrabold, fontSize: 28, color: colors.ink },
  sub: { fontFamily: font.medium, fontSize: 14, color: colors.ink2, lineHeight: 20 },
  or: { fontFamily: font.medium, fontSize: 13, color: colors.caption, textAlign: 'center' },
  note: { fontFamily: font.medium, fontSize: 12, color: colors.caption, textAlign: 'center' },
});