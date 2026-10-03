import { createAsyncThunk , createSlice } from "@reduxjs/toolkit";
import { listBudgetsWithSpent, setBudget, type BudgetWithSpent } from "@/db/budgetsRepo";
import { refreshPending } from "./syncSlice";
import type { CategoryKey }from '@/constants/theme';

type BudgetsState = {
    items : BudgetWithSpent [];
    status : 'idle' | 'loading' | 'ready' | 'error';
    error : string | null;
};

const initialState: BudgetsState = { items: [], status: 'idle', error: null };

export const loadBudgets = createAsyncThunk('budgets/load', async () => {
  return listBudgetsWithSpent();
});

export const saveBudget = createAsyncThunk(
  'budgets/save',
  async (args: { category: CategoryKey; limitCents: number }, { dispatch }) => {
    await setBudget(args.category, args.limitCents);
    await dispatch(loadBudgets());
    await dispatch(refreshPending());
  },
);

const budgetsSlice = createSlice({
  name: 'budgets',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadBudgets.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(loadBudgets.fulfilled, (state, action) => {
        state.items = action.payload;
        state.status = 'ready';
        state.error = null;
      })
      .addCase(loadBudgets.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.error.message ?? 'Could not load budgets';
      });
  },
});


export default budgetsSlice.reducer;