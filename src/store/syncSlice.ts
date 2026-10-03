import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { countPending } from '@/db/transactionsRepo';
import type { SyncState } from '@/components/SyncBadge';

type SyncSliceState = {
  pendingCount: number; 
  status: SyncState; 
};

const initialState: SyncSliceState = { pendingCount: 0, status: 'synced' };


export const refreshPending = createAsyncThunk('sync/refreshPending', async () => {
  return countPending();
});

const syncSlice = createSlice({
  name: 'sync',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(refreshPending.fulfilled, (state, action) => {
      state.pendingCount = action.payload;
      state.status = action.payload > 0 ? 'pending' : 'synced';
    });
  },
});

export default syncSlice.reducer;