import type { Transaction } from '@/db/transactionsRepo';
import type { BudgetWithSpent } from '@/db/budgetsRepo';
import type { CategoryKey } from '@/constants/theme';
import { CATEGORY_LABELS } from '@/constants/categories';
import { formatLKR } from './currency';

export type CategorySlice = { category: CategoryKey; cents: number; share: number };
export type MonthTotal = { key: string; label: string; spentCents: number };

function inMonth(iso: string, year: number, month: number) {
  const d = new Date(iso);
  return d.getFullYear() === year && d.getMonth() === month;
}

export function categoryBreakdown(items: Transaction[], now = new Date()): CategorySlice[] {
  const totals = new Map<CategoryKey, number>();
  let all = 0;
  for (const t of items) {
    if (t.direction !== 'out' || !inMonth(t.occurredAt, now.getFullYear(), now.getMonth())) continue;
    totals.set(t.category, (totals.get(t.category) ?? 0) + t.amountCents);
    all += t.amountCents;
  }
  return [...totals.entries()]
    .map(([category, cents]) => ({ category, cents, share: all ? cents / all : 0 }))
    .sort((a, b) => b.cents - a.cents);
}

/** Spending per month for the last `n` months, oldest first. */
export function monthlyTotals(items: Transaction[], n = 6, now = new Date()): MonthTotal[] {
  const out: MonthTotal[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    let spentCents = 0;
    for (const t of items) {
      if (t.direction === 'out' && inMonth(t.occurredAt, d.getFullYear(), d.getMonth())) spentCents += t.amountCents;
    }
    out.push({
      key: `${d.getFullYear()}-${d.getMonth() + 1}`,
      label: d.toLocaleDateString('en-GB', { month: 'short' }),
      spentCents,
    });
  }
  return out;
}

/** Straight-line projection: spend so far, scaled to the whole month. Needs at least 3 days of data. */
export function forecastMonthEnd(spentSoFarCents: number, now = new Date()): number | null {
  const day = now.getDate();
  if (day < 3 || spentSoFarCents <= 0) return null;
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  return Math.round((spentSoFarCents / day) * daysInMonth);
}

export function topMerchants(items: Transaction[], limit = 3, now = new Date()) {
  const totals = new Map<string, { cents: number; count: number }>();
  for (const t of items) {
    if (t.direction !== 'out' || !inMonth(t.occurredAt, now.getFullYear(), now.getMonth())) continue;
    const key = t.merchant.trim();
    const cur = totals.get(key) ?? { cents: 0, count: 0 };
    totals.set(key, { cents: cur.cents + t.amountCents, count: cur.count + 1 });
  }
  return [...totals.entries()]
    .map(([merchant, v]) => ({ merchant, ...v }))
    .sort((a, b) => b.cents - a.cents)
    .slice(0, limit);
}

/** Plain-language insights: transparent rules over your own data, so each sentence can be checked. */
export function buildInsights(
  items: Transaction[],
  budgets: BudgetWithSpent[],
  now = new Date(),
): { tone: 'info' | 'warning' | 'success'; title: string; message: string }[] {
  const out: { tone: 'info' | 'warning' | 'success'; title: string; message: string }[] = [];
  const months = monthlyTotals(items, 2, now);
  const cur = months[1].spentCents;
  const dayOfMonth = now.getDate();

  // Compare this month so far with the same number of days last month
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevToDate = items
    .filter((t) => t.direction === 'out' && inMonth(t.occurredAt, lastMonth.getFullYear(), lastMonth.getMonth()) && new Date(t.occurredAt).getDate() <= dayOfMonth)
    .reduce((s, t) => s + t.amountCents, 0);
  if (prevToDate > 0 && cur > 0) {
    const pct = Math.round(((cur - prevToDate) / prevToDate) * 100);
    if (Math.abs(pct) >= 5) {
      out.push({
        tone: pct > 0 ? 'warning' : 'success',
        title: pct > 0 ? `Spending is up ${pct}% on last month` : `Spending is down ${-pct}% on last month`,
        message: `Same point in the month: ${formatLKR(cur / 100)} now vs ${formatLKR(prevToDate / 100)} then.`,
      });
    }
  }

  const slices = categoryBreakdown(items, now);
  if (slices[0] && slices[0].share >= 0.35) {
    out.push({
      tone: 'info',
      title: `${CATEGORY_LABELS[slices[0].category]} is your biggest category`,
      message: `${Math.round(slices[0].share * 100)}% of this month's spending (${formatLKR(slices[0].cents / 100)}).`,
    });
  }

  const forecast = forecastMonthEnd(cur, now);
  const budgetTotal = budgets.reduce((s, b) => s + b.limitCents, 0);
  if (forecast && budgetTotal > 0) {
    const over = forecast > budgetTotal;
    out.push({
      tone: over ? 'warning' : 'success',
      title: over ? 'On track to pass your budgets' : 'On track to stay within budgets',
      message: `At this pace you'll spend about ${formatLKR(forecast / 100)} by month end, against ${formatLKR(budgetTotal / 100)} budgeted.`,
    });
  }

  return out;
}