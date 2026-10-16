import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from '@firebase/auth';
import { getFirebaseAuth, isFirebaseConfigured } from '@/config/firebase';
import { getKv, setKv, deleteKv } from '@/db/kvRepo';
import { clearAllData } from '@/db/maintenance';
import { listQueue, resetSyncState } from '@/db/syncRepo';
import { syncAll } from '@/sync/syncService';
import { loadTransactions } from './transactionsSlice';
import { loadBudgets } from './budgetsSlice';
import { loadBills } from './billsSlice';
import { refreshPending } from './syncSlice';
import { runSync } from './syncThunks';

export type AuthStatus = 'loading' | 'onboarding' | 'signedOut' | 'signedIn' | 'offlineMode';

type AuthState = {
  status: AuthStatus;
  uid: string | null;
  email: string | null;
  busy: boolean;
  error: string | null;
};

const initialState: AuthState = { status: 'loading', uid: null, email: null, busy: false, error: null };

/** Turns Firebase's error codes into sentences a person can act on. */
function friendly(e: unknown): string {
  const code = (e as { code?: string } | null)?.code ?? '';
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'That email or password is not right.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Try signing in.';
    case 'auth/weak-password':
      return 'Choose a password with at least 6 characters.';
    case 'auth/invalid-email':
      return 'That email address does not look right.';
    case 'auth/network-request-failed':
      return 'No internet connection. Try again when you are online, or continue offline.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Wait a minute and try again.';
    default:
      return String((e as Error | null)?.message ?? 'Something went wrong');
  }
}

let listening = false;

/** Reads saved choices, then listens to Firebase so the app always knows who is signed in. */
export const bootstrapAuth = createAsyncThunk('auth/bootstrap', async (_: void, { dispatch }) => {
  const onboarded = (await getKv('onboarded')) === '1';
  if (!onboarded) {
    dispatch(authResolved({ status: 'onboarding' }));
    return;
  }
  const offlineChoice = (await getKv('mode')) === 'offline';

  if (!isFirebaseConfigured) {
    dispatch(authResolved({ status: 'offlineMode' }));
    return;
  }
  if (listening) return;
  listening = true;
  let first = true;
  onAuthStateChanged(getFirebaseAuth(), (user) => {
    if (user) {
      dispatch(authResolved({ status: 'signedIn', uid: user.uid, email: user.email }));
      dispatch(runSync());
    } else if (first && offlineChoice) {
      dispatch(authResolved({ status: 'offlineMode' }));
    } else if (!first || !offlineChoice) {
      dispatch(authResolved({ status: 'signedOut' }));
    }
    first = false;
  });
});

export const finishOnboarding = createAsyncThunk('auth/finishOnboarding', async (_: void, { dispatch }) => {
  await setKv('onboarded', '1');
  if (!isFirebaseConfigured) {
    await setKv('mode', 'offline');
    dispatch(authResolved({ status: 'offlineMode' }));
  } else {
    dispatch(bootstrapAuth());
  }
});

export const continueOffline = createAsyncThunk('auth/continueOffline', async (_: void, { dispatch }) => {
  await setKv('mode', 'offline');
  dispatch(authResolved({ status: 'offlineMode' }));
});

export const signIn = createAsyncThunk('auth/signIn', async (args: { email: string; password: string }, { rejectWithValue }) => {
  try {
    await signInWithEmailAndPassword(getFirebaseAuth(), args.email.trim(), args.password);
    await deleteKv('mode');
  } catch (e) {
    return rejectWithValue(friendly(e));
  }
});

export const register = createAsyncThunk('auth/register', async (args: { email: string; password: string }, { rejectWithValue }) => {
  try {
    await createUserWithEmailAndPassword(getFirebaseAuth(), args.email.trim(), args.password);
    await deleteKv('mode');
  } catch (e) {
    return rejectWithValue(friendly(e));
  }
});

/**
 * Signing out removes this phone's local copy (the cloud keeps it), so the next account never sees it.
 * Anything not uploaded yet is sent first; if that can't finish, sign-out is blocked so nothing is lost.
 */
export const signOutUser = createAsyncThunk('auth/signOut', async (_: void, { dispatch, getState, rejectWithValue }) => {
  const { auth } = getState() as { auth: AuthState };
  try {
    if (auth.uid) {
      await syncAll(auth.uid);
      const left = (await listQueue()).length;
      if (left > 0) return rejectWithValue(`${left} change${left === 1 ? '' : 's'} haven't uploaded yet. Connect to the internet and try again.`);
    }
    await clearAllData();
    await resetSyncState();
    await signOut(getFirebaseAuth());
    await Promise.all([dispatch(loadTransactions()), dispatch(loadBudgets()), dispatch(loadBills()), dispatch(refreshPending())]);
  } catch (e) {
    return rejectWithValue(friendly(e));
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    authResolved(state, action: PayloadAction<{ status: AuthStatus; uid?: string; email?: string | null }>) {
      state.status = action.payload.status;
      state.uid = action.payload.uid ?? null;
      state.email = action.payload.email ?? null;
      state.error = null;
    },
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    const pending = (s: AuthState) => {
      s.busy = true;
      s.error = null;
    };
    const rejected = (s: AuthState, a: { payload?: unknown }) => {
      s.busy = false;
      s.error = typeof a.payload === 'string' ? a.payload : 'Something went wrong';
    };
    builder
      .addCase(signIn.pending, pending)
      .addCase(signIn.fulfilled, (s) => void (s.busy = false))
      .addCase(signIn.rejected, rejected)
      .addCase(register.pending, pending)
      .addCase(register.fulfilled, (s) => void (s.busy = false))
      .addCase(register.rejected, rejected)
      .addCase(signOutUser.pending, pending)
      .addCase(signOutUser.fulfilled, (s) => void (s.busy = false))
      .addCase(signOutUser.rejected, rejected);
  },
});

export const { authResolved, clearAuthError } = authSlice.actions;
export default authSlice.reducer;