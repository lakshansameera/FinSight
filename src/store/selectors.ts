import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from './index';
import { monthRange } from '@/utils/dates';
import { billStatus } from '@/utils/bills';
import { formatLKR } from '@/utils/currency';
import { CATEGORY_LABELS } from '@/constants/categories';

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

export const selectBills = (s: RootState) => s.bills.items;

/** Bills with their live status, most urgent first: overdue, due soon, upcoming, paid. */
export const selectBillsWithStatus = createSelector([selectBills], (bills) => {
  const order = { overdue: 0, dueSoon: 1, upcoming: 2, paid: 3 } as const;
  return bills
    .map((bill) => ({ bill, ...billStatus(bill) }))
    .sort((a, b) => order[a.status] - order[b.status] || a.daysLeft - b.daysLeft);
});

export const selectBillsSummary = createSelector([selectBillsWithStatus], (items) => {
  let remainingCents = 0;
  let paidCents = 0;
  let attention = 0; // overdue + due soon
  for (const { bill, status } of items) {
    if (status === 'paid') paidCents += bill.amountCents;
    else remainingCents += bill.amountCents;
    if (status === 'overdue' || status === 'dueSoon') attention++;
  }
  return { remainingCents, paidCents, attention, count: items.length };
});

export type AppNotification = {
  id: string;
  tone: 'warning' | 'danger' | 'info';
  title: string;
  message: string;
  target: { screen: 'BillDetail'; billId: string } | { screen: 'Budgets' };
};

/** Alerts built from data already on the phone, so they work offline. */
export const selectNotifications = createSelector(
  [selectBillsWithStatus, selectBudgets],
  (bills, budgets): AppNotification[] => {
    const out: AppNotification[] = [];
    for (const { bill, status, daysLeft } of bills) {
      if (status === 'overdue') {
        out.push({
          id: `bill-${bill.id}`,
          tone: 'danger',
          title: `${bill.name} is overdue`,
          message: `${formatLKR(bill.amountCents / 100)} was due ${-daysLeft} day${-daysLeft === 1 ? '' : 's'} ago.`,
          target: { screen: 'BillDetail', billId: bill.id },
        });
      } else if (status === 'dueSoon') {
        out.push({
          id: `bill-${bill.id}`,
          tone: 'warning',
          title: `${bill.name} is due ${daysLeft === 0 ? 'today' : daysLeft === 1 ? 'tomorrow' : `in ${daysLeft} days`}`,
          message: `${formatLKR(bill.amountCents / 100)} to pay.`,
          target: { screen: 'BillDetail', billId: bill.id },
        });
      }
    }
    for (const b of budgets) {
      const ratio = b.spentCents / b.limitCents;
      if (ratio < 0.8) continue;
      out.push({
        id: `budget-${b.id}`,
        tone: ratio >= 1 ? 'danger' : 'warning',
        title: `${CATEGORY_LABELS[b.category]} budget at ${Math.round(ratio * 100)}%`,
        message:
          ratio >= 1
            ? `Over by ${formatLKR((b.spentCents - b.limitCents) / 100)} this month.`
            : `${formatLKR((b.limitCents - b.spentCents) / 100)} left this month.`,
        target: { screen: 'Budgets' },
      });
    }
    return out;
  },
);