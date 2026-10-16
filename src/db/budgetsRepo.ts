import * as Crypto from 'expo-crypto';
import { getDb } from './client';
import { enqueue } from './outbox';
import { monthRange } from '@/utils/dates';
import type { CategoryKey } from '@/constants/theme';

export type BudgetWithSpent = {
  id: string;
  category: CategoryKey;
  limitCents: number;
  spentCents: number; 
};


export async function setBudget(category: CategoryKey, limitCents: number): Promise<void> {
  const db = await getDb();
  const now = new Date().toISOString();

  await db.withExclusiveTransactionAsync(async (txn) => {
    const existing = await txn.getFirstAsync<{ id: string }>('SELECT id FROM budgets WHERE category = ?', [category]);
    const id = existing?.id ?? Crypto.randomUUID();

    await txn.runAsync(
      `INSERT INTO budgets (id, category, limit_cents, updated_at, deleted, sync_status)
       VALUES (?, ?, ?, ?, 0, 'pending')
       ON CONFLICT(category) DO UPDATE SET
         limit_cents = excluded.limit_cents,
         updated_at  = excluded.updated_at,
         deleted     = 0,
         sync_status = 'pending'`,
      [id, category, Math.round(limitCents), now],
    );
    await enqueue(txn, 'budget', id, 'upsert', { id, category, limitCents, updatedAt: now });
  });
}


export async function listBudgetsWithSpent(date = new Date()): Promise<BudgetWithSpent[]> {
  const db = await getDb();
  const { start, end } = monthRange(date);

  const rows = await db.getAllAsync<{ id: string; category: string; limit_cents: number; spent_cents: number }>(
    `SELECT b.id, b.category, b.limit_cents,
            COALESCE(SUM(t.amount_cents), 0) AS spent_cents
       FROM budgets b
       LEFT JOIN transactions t
              ON t.category = b.category
             AND t.direction = 'out'
             AND t.deleted = 0
             AND t.occurred_at >= ? AND t.occurred_at < ?
      WHERE b.deleted = 0
      GROUP BY b.id
      ORDER BY spent_cents * 1.0 / b.limit_cents DESC`,
    [start, end],
  );

  return rows.map((r) => ({
    id: r.id,
    category: r.category as CategoryKey,
    limitCents: r.limit_cents,
    spentCents: r.spent_cents,
  }));
}


export async function deleteBudget(id: string): Promise<void> {
  const db = await getDb();
  const now = new Date().toISOString();
  await db.withExclusiveTransactionAsync(async (txn) => {
    const res = await txn.runAsync(
      `UPDATE budgets SET deleted = 1, updated_at = ?, sync_status = 'pending' WHERE id = ? AND deleted = 0`,
      [now, id],
    );
    if (res.changes === 0) return;
    await enqueue(txn, 'budget', id, 'delete', { id, updatedAt: now });
  });
}