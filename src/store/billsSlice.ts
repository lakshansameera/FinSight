import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { addBill, deleteBill, listBills, markBillPaid, updateBill, type Bill, type BillInput } from '@/db/billsRepo';
import { loadBudgets } from './budgetsSlice';
import { loadTransactions } from './transactionsSlice';
import { refreshPending } from './syncSlice';
import { syncBillReminders } from '@/utils/reminders';

type BillsState = {
  items: Bill[];
  status: 'idle' | 'loading' | 'ready' | 'error';
  error: string | null;
};

const initialState: BillsState = { items: [], status: 'idle', error: null };

export const loadBills = createAsyncThunk('bills/load', async () => {
  const bills = await listBills();
  void syncBillReminders(bills); // keep local reminders in step with the data
  return bills;
});

export const createBill = createAsyncThunk('bills/create', async (input: BillInput, { dispatch }) => {
  const bill = await addBill(input);
  await dispatch(loadBills());
  dispatch(refreshPending());
  return bill;
});

export const editBill = createAsyncThunk(
  'bills/edit',
  async (args: { id: string; changes: Partial<BillInput> }, { dispatch }) => {
    const bill = await updateBill(args.id, args.changes);
    await dispatch(loadBills());
    dispatch(refreshPending());
    return bill;
  },
);

export const removeBill = createAsyncThunk('bills/remove', async (id: string, { dispatch }) => {
  await deleteBill(id);
  await dispatch(loadBills());
  dispatch(refreshPending());
});

export const payBill = createAsyncThunk('bills/pay', async (id: string, { dispatch }) => {
  await markBillPaid(id);
  await dispatch(loadBills());
  dispatch(loadTransactions()); // the payment is a new expense
  dispatch(loadBudgets()); // ...which changes budget bars
  dispatch(refreshPending());
});

const billsSlice = createSlice({
  name: 'bills',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadBills.pending, (s) => {
        s.status = 'loading';
      })
      .addCase(loadBills.fulfilled, (s, a) => {
        s.items = a.payload;
        s.status = 'ready';
        s.error = null;
      })
      .addCase(loadBills.rejected, (s, a) => {
        s.status = 'error';
        s.error = a.error.message ?? 'Could not load bills';
      });
  },
});

export default billsSlice.reducer;