import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { countPending } from '@/db/transactionsRepo';
import type { SyncState } from '@/components/SyncBadge';

type SyncSliceState = {
  pendingCount: number; // changes waiting in the queue
  online: boolean; // false when the phone has no connection
  syncing: boolean; // a sync pass is running
  lastError: string | null;
  lastSyncedAt: string | null;
  status: SyncState; // what the badge shows
};

const initialState: SyncSliceState = {
  pendingCount: 0,
  online: true,
  syncing: false,
  lastError: null,
  lastSyncedAt: null,
  status: 'synced',
};

export const refreshPending = createAsyncThunk('sync/refreshPending', async () => {
  return countPending();
});

/** One place decides the badge, so every screen agrees. */
function recompute(s: SyncSliceState) {
  if (s.syncing) s.status = 'syncing';
  else if (!s.online) s.status = 'offline';
  else s.status = s.pendingCount > 0 ? 'pending' : 'synced';
}

const syncSlice = createSlice({
  name: 'sync',
  initialState,
  reducers: {
    setOnline(state, action: PayloadAction<boolean>) {
      state.online = action.payload;
      recompute(state);
    },
    syncStarted(state) {
      state.syncing = true;
      recompute(state);
    },
    syncFinished(state, action: PayloadAction<{ error: string | null; offline?: boolean }>) {
      state.syncing = false;
      state.lastError = action.payload.error;
      if (action.payload.offline) state.online = false;
      if (!action.payload.error) {
        state.online = true;
        state.lastSyncedAt = new Date().toISOString();
      }
      recompute(state);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(refreshPending.fulfilled, (state, action) => {
      state.pendingCount = action.payload;
      recompute(state);
    });
  },
});

export const { setOnline, syncStarted, syncFinished } = syncSlice.actions;
export default syncSlice.reducer;