import { createAsyncThunk } from '@reduxjs/toolkit';
import { isFirebaseConfigured } from '@/config/firebase';
import { isNetworkError, syncAll } from '@/sync/syncService';
import { loadTransactions } from './transactionsSlice';
import { loadBudgets } from './budgetsSlice';
import { loadBills } from './billsSlice';
import { refreshPending, syncFinished, syncStarted } from './syncSlice';
import type { RootState } from './index';

/** Runs one sync pass if the user is signed in and online. Safe to call as often as you like. */
export const runSync = createAsyncThunk('sync/run', async (_: void, { dispatch, getState }) => {
  const state = getState() as RootState;
  const { status, uid } = state.auth;
  if (!isFirebaseConfigured || status !== 'signedIn' || !uid) return;
  if (state.sync.syncing || !state.sync.online) return;

  dispatch(syncStarted());
  try {
    const result = await syncAll(uid);
    dispatch(syncFinished({ error: null }));
    if (result.changedLocal) {
      await Promise.all([dispatch(loadTransactions()), dispatch(loadBudgets()), dispatch(loadBills())]);
    }
  } catch (e) {
    dispatch(syncFinished({ error: String((e as Error).message ?? e), offline: isNetworkError(e) }));
  } finally {
    dispatch(refreshPending());
  }
});