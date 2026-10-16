import { useCallback, useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { AppHeader } from '@/components/AppHeader';
import { Banner } from '@/components/Banner';
import { Button } from '@/components/Button';
import { colors, font } from '@/constants/theme';
import { clearAllData, dataCounts } from '@/db/maintenance';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectBills, selectSync } from '@/store/selectors';
import { loadTransactions } from '@/store/transactionsSlice';
import { loadBudgets } from '@/store/budgetsSlice';
import { loadBills } from '@/store/billsSlice';
import { refreshPending } from '@/store/syncSlice';
import { syncBillReminders } from '@/utils/reminders';
import { resetSyncState } from '@/db/syncRepo';
import { isFirebaseConfigured } from '@/config/firebase';
import { authResolved, signOutUser } from '@/store/authSlice';
import { runSync } from '@/store/syncThunks';

function Row({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

export default function SettingsScreen() {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const sync = useAppSelector(selectSync);
  const bills = useAppSelector(selectBills);
  const auth = useAppSelector((st) => st.auth);
  const [counts, setCounts] = useState({ transactions: 0, budgets: 0, bills: 0 });
  const [reminderMsg, setReminderMsg] = useState<string | null>(null);

  const refresh = useCallback(async () => setCounts(await dataCounts()), []);
  useEffect(() => {
    refresh();
  }, [refresh, sync.pendingCount]);

  async function onReminders() {
    const n = await syncBillReminders(bills);
    setReminderMsg(
      n > 0
        ? `${n} reminder${n === 1 ? '' : 's'} scheduled on this phone.`
        : 'No reminders scheduled. Add a bill, or allow notifications in your phone settings.',
    );
  }

  function onClear() {
    Alert.alert('Delete all local data?', 'This removes every transaction, budget and bill stored on this phone. It cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete everything',
        style: 'destructive',
        onPress: async () => {
          await clearAllData();
          await resetSyncState();
          dispatch(runSync());
          await Promise.all([
            dispatch(loadTransactions()),
            dispatch(loadBudgets()),
            dispatch(loadBills()),
            dispatch(refreshPending()),
          ]);
          refresh();
        },
      },
    ]);
  }

    function onSignOut() {
    Alert.alert('Sign out?', "Your data stays safe in the cloud. This phone's copy is removed and comes back when you sign in again.", [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: async () => {
          const res = await dispatch(signOutUser());
          if (signOutUser.rejected.match(res)) Alert.alert('Could not sign out', String(res.payload ?? 'Try again'));
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <AppHeader title="Settings" onBack={() => navigation.goBack()} />

        <Text style={styles.section}>Sync</Text>
                <Text style={styles.section}>Account & sync</Text>
        <View style={styles.card}>
          <Row
            label="Account"
            value={auth.status === 'signedIn' ? (auth.email ?? 'Signed in') : isFirebaseConfigured ? 'Not signed in' : 'Cloud not set up'}
          />
          <Row
            label="Status"
            value={
              sync.status === 'synced'
                ? 'Up to date'
                : sync.status === 'syncing'
                  ? 'Syncing…'
                  : sync.status === 'offline'
                    ? 'Offline'
                    : `${sync.pendingCount} change${sync.pendingCount === 1 ? '' : 's'} waiting`
            }
          />
          {sync.lastSyncedAt ? <Row label="Last synced" value={new Date(sync.lastSyncedAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} /> : null}
          {sync.lastError && sync.status !== 'synced' ? <Text style={styles.msg}>Last problem: {sync.lastError}</Text> : null}

          {auth.status === 'signedIn' ? (
            <>
              <Button title="Sync now" variant="tonal" size="md" icon="sync" loading={sync.syncing} onPress={() => dispatch(runSync())} />
              <Button title="Sign out" variant="outline" size="md" loading={auth.busy} onPress={onSignOut} />
            </>
          ) : isFirebaseConfigured ? (
            <Button title="Sign in to back up" variant="tonal" size="md" onPress={() => dispatch(authResolved({ status: 'signedOut' }))} />
          ) : null}
        </View>
        <Banner
          tone="info"
          title="Offline first"
          message={
            isFirebaseConfigured
              ? 'Everything is saved on this phone first and uploaded when you are online.'
              : 'Cloud backup is not set up in this build, so your data stays on this phone.'
          }
        />
        <Text style={styles.section}>Reminders</Text>
        <View style={styles.card}>
          <Row label="Bills tracked" value={String(counts.bills)} />
          <Button title="Refresh bill reminders" variant="tonal" size="md" icon="clock" onPress={onReminders} />
          {reminderMsg ? <Text style={styles.msg}>{reminderMsg}</Text> : null}
        </View>

        <Text style={styles.section}>Your data</Text>
        <View style={styles.card}>
          <Row label="Transactions" value={String(counts.transactions)} />
          <Row label="Budgets" value={String(counts.budgets)} />
          <Button title="Delete all local data" variant="danger" size="md" onPress={onClear} />
        </View>

        <Text style={styles.section}>About</Text>
        <View style={styles.card}>
          <Row label="App" value="FinSight 1.0.0" />
          <Row label="Module" value="SE5070 Enterprise Mobility" />
          <Button title="Component gallery" variant="outline" size="md" onPress={() => navigation.navigate('Gallery')} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16, gap: 12, paddingBottom: 48 },
  section: { fontFamily: font.bold, fontSize: 17, color: colors.ink, marginTop: 8 },
  card: { backgroundColor: colors.surface, borderRadius: 20, padding: 16, gap: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  rowLabel: { fontFamily: font.medium, fontSize: 14, color: colors.ink2 },
  rowValue: { flexShrink: 1, fontFamily: font.semibold, fontSize: 14, color: colors.ink, textAlign: 'right' },
  msg: { fontFamily: font.medium, fontSize: 12, color: colors.caption },
});