import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from './index';
import { monthRange } from '@/utils/dates';

export const selectTransactions = (s: RootState) => s.transactions.items;
export const selectBudgets = (s: RootState) => s.budgets.items;
export const selectSync = (s: RootState) => s.sync;


export const selectMonthTotals = createSelector([selectTransactions], (items) => {
  const { start, end } = monthRange();
  let spentCents = 0;
  let incomeCents = 0;
  for (const t of items) {
    if (t.occurredAt < start || t.occurredAt >= end) continue;
    if (t.direction === 'out') spentCents += t.amountCents;
    else incomeCents += t.amountCents;
  }
  return { spentCents, incomeCents };
});