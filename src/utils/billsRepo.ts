import * as Crypto from 'expo-crypto';
import { getDb } from './client';
import { enqueue } from './outbox';
import { addTransaction } from './transactionsRepo';
import { monthKey } from '@/utils/dates';
import type { CategoryKey } from '@/constants/theme';

export type Bill = {
  id: string;
  name: string;
  category: CategoryKey;
  amountCents: number;
  dueDay: number;
  remindDaysBefore: number;
  lastPaidMonth: string | null;
  updatedAt: string;
  syncStatus: 'pending' | 'synced';
};

type BillRow = {
  id: string;
  name: string;
  category: string;
  amount_cents: number;
  due_day: number;
  remind_days_before: number;
  last_paid_month: string | null;
  updated_at: string;
  sync_status: 'pending' | 'synced';
};

function fromRow(r: BillRow): Bill {
  return {
    id: r.id,
    name: r.name,
    category: r.category as CategoryKey,
    amountCents: r.amount_cents,
    dueDay: r.due_day,
    remindDaysBefore: r.remind_days_before,
    lastPaidMonth: r.last_paid_month,
    updatedAt: r.updated_at,
    syncStatus: r.sync_status,
  };
}

export type BillInput = {
  name: string;
  category?: CategoryKey;
  amountCents: number;
  dueDay: number;
  remindDaysBefore?: number;
};

export async function listBills(): Promise<Bill[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<BillRow>('SELECT * FROM bills WHERE deleted = 0 ORDER BY due_day ASC, name ASC');
  return rows.map(fromRow);
}

export async function getBill(id: string): Promise<Bill | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<BillRow>('SELECT * FROM bills WHERE id = ? AND deleted = 0', [id]);
  return row ? fromRow(row) : null;
}

export async function addBill(input: BillInput): Promise<Bill> {
  const db = await getDb();
  const bill: Bill = {
    id: Crypto.randomUUID(),
    name: input.name.trim(),
    category: input.category ?? 'bills',
    amountCents: Math.round(input.amountCents),
    dueDay: input.dueDay,
    remindDaysBefore: input.remindDaysBefore ?? 2,
    lastPaidMonth: null,
    updatedAt: new Date().toISOString(),
    syncStatus: 'pending',
  };
  await db.withExclusiveTransactionAsync(async (txn) => {
    await txn.runAsync(
      `INSERT INTO bills (id, name, category, amount_cents, due_day, remind_days_before, last_paid_month, updated_at, sync_status)
       VALUES (?, ?, ?, ?, ?, ?, NULL, ?, 'pending')`,
      [bill.id, bill.name, bill.category, bill.amountCents, bill.dueDay, bill.remindDaysBefore, bill.updatedAt],
    );
    await enqueue(txn, 'bill', bill.id, 'upsert', bill);
  });
  return bill;
}

export async function updateBill(id: string, changes: Partial<BillInput>): Promise<Bill> {
  const current = await getBill(id);
  if (!current) throw new Error(`Bill ${id} not found`);
  const updated: Bill = {
    ...current,
    name: (changes.name ?? current.name).trim(),
    category: changes.category ?? current.category,
    amountCents: Math.round(changes.amountCents ?? current.amountCents),
    dueDay: changes.dueDay ?? current.dueDay,
    remindDaysBefore: changes.remindDaysBefore ?? current.remindDaysBefore,
    updatedAt: new Date().toISOString(),
    syncStatus: 'pending',
  };
  const db = await getDb();
  await db.withExclusiveTransactionAsync(async (txn) => {
    await txn.runAsync(
      `UPDATE bills SET name = ?, category = ?, amount_cents = ?, due_day = ?, remind_days_before = ?,
              updated_at = ?, sync_status = 'pending' WHERE id = ?`,
      [updated.name, updated.category, updated.amountCents, updated.dueDay, updated.remindDaysBefore, updated.updatedAt, id],
    );
    await enqueue(txn, 'bill', id, 'upsert', updated);
  });
  return updated;
}

export async function deleteBill(id: string): Promise<void> {
  const db = await getDb();
  const now = new Date().toISOString();
  await db.withExclusiveTransactionAsync(async (txn) => {
    const res = await txn.runAsync(
      `UPDATE bills SET deleted = 1, updated_at = ?, sync_status = 'pending' WHERE id = ? AND deleted = 0`,
      [now, id],
    );
    if (res.changes === 0) return;
    await enqueue(txn, 'bill', id, 'delete', { id, updatedAt: now });
  });
}

/** Marks this month's bill as paid AND records the payment as an expense, so budgets update. */
export async function markBillPaid(id: string): Promise<Bill> {
  const bill = await getBill(id);
  if (!bill) throw new Error(`Bill ${id} not found`);
  const month = monthKey();
  if (bill.lastPaidMonth === month) return bill;

  await addTransaction({
    amountCents: bill.amountCents,
    direction: 'out',
    category: bill.category,
    merchant: bill.name,
    note: 'Bill payment',
  });

  const updated: Bill = { ...bill, lastPaidMonth: month, updatedAt: new Date().toISOString(), syncStatus: 'pending' };
  const db = await getDb();
  await db.withExclusiveTransactionAsync(async (txn) => {
    await txn.runAsync(
      `UPDATE bills SET last_paid_month = ?, updated_at = ?, sync_status = 'pending' WHERE id = ?`,
      [month, updated.updatedAt, id],
    );
    await enqueue(txn, 'bill', id, 'upsert', updated);
  });
  return updated;
}