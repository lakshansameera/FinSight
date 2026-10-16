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


export const selectRecent = createSelector([selectTransactions], (items) => items.slice(0, 5));

export const selectBudgetSummary = createSelector([selectBudgets], (budgets) => {
  let limitCents = 0;
  let spentCents = 0;
  for (const b of budgets) {
    limitCents += b.limitCents;
    spentCents += b.spentCents;
  }
  return { limitCents, spentCents, count: budgets.length };
});

export const selectBudgetAlert = createSelector([selectBudgets], (budgets) => {
  const top = budgets[0];
  if (!top) return null;
  const ratio = top.spentCents / top.limitCents;
  return ratio >= 0.8 ? { ...top, ratio } : null;
});