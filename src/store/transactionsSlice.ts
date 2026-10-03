import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  addTransaction,
  deleteTransaction,
  listTransactions,
  updateTransaction,
  type NewTransaction,
  type Transaction,
} from '@/db/transactionsRepo';
import { loadBudgets } from './budgetsSlice';
import { refreshPending } from './syncSlice';


type TransactionsState = {
  items: Transaction[]; // newest first
  status: 'idle' | 'loading' | 'ready' | 'error';
  error: string | null;
};

const initialState: TransactionsState = { items: [], status: 'idle', error: null };

export const loadTransactions = createAsyncThunk('transactions/load', async () => {
  return listTransactions(200);
});

export const createTransaction = createAsyncThunk(
  'transactions/create',
  async (input: NewTransaction, { dispatch }) => {
    const tx = await addTransaction(input); 
    dispatch(loadBudgets()); 
    dispatch(refreshPending()); 
    return tx; 
  },
);

export const editTransaction = createAsyncThunk(
  'transactions/edit',
  async (args: { id: string; changes: Partial<Omit<NewTransaction, 'source'>> }, { dispatch }) => {
    const tx = await updateTransaction(args.id, args.changes);
    dispatch(loadBudgets());
    dispatch(refreshPending());
    return tx;
  },
);

export const removeTransaction = createAsyncThunk('transactions/remove', async (id: string, { dispatch }) => {
  await deleteTransaction(id);
  dispatch(loadBudgets());
  dispatch(refreshPending());
  return id;
});

const transactionsSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadTransactions.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(loadTransactions.fulfilled, (state, action) => {
        state.items = action.payload;
        state.status = 'ready';
        state.error = null;
      })
      .addCase(loadTransactions.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.error.message ?? 'Could not load transactions';
      })
      .addCase(createTransaction.fulfilled, (state, action) => {
        state.items.unshift(action.payload); // add to the top (newest first)
        state.items.sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
      })
      .addCase(editTransaction.fulfilled, (state, action) => {
        const i = state.items.findIndex((t) => t.id === action.payload.id);
        if (i !== -1) state.items[i] = action.payload;
        state.items.sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
      })
      .addCase(removeTransaction.fulfilled, (state, action) => {
        state.items = state.items.filter((t) => t.id !== action.payload);
      })
      // Any failed write: keep the list, show the error
      .addMatcher(
        (action) => action.type.startsWith('transactions/') && action.type.endsWith('/rejected'),
        (state, action: { error: { message?: string } }) => {
          state.error = action.error.message ?? 'Something went wrong';
        },
      );
  },
});

export default transactionsSlice.reducer;