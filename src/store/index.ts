import { configureStore } from '@reduxjs/toolkit';
import transactions from './transactionsSlice';
import budgets from './budgetsSlice';
import sync from './syncSlice';
import bills from './billsSlice';

export const store = configureStore({
  reducer: {
    transactions,
    budgets,
    sync,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;