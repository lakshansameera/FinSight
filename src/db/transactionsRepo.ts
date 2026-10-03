import * as Crypto from 'expo-crypto';
import { getDb } from './client';
import { enqueue } from './outbox';
import type { CategoryKey } from '@/constants/theme';


export type Transaction = {
  id: string;
  amountCents: number;
  direction: 'in' | 'out';
  category: CategoryKey;
  merchant: string;
  note: string | null;
  occurredAt: string;
  source: 'manual' | 'receipt' | 'paste';
  updatedAt: string;
  syncStatus: 'pending' | 'synced';
};


type TransactionRow = {
  id: string;
  amount_cents: number;
  direction: 'in' | 'out';
  category: string;
  merchant: string;
  note: string | null;
  occurred_at: string;
  source: 'manual' | 'receipt' | 'paste';
  updated_at: string;
  sync_status: 'pending' | 'synced';
};

function fromRow(r: TransactionRow): Transaction {
  return {
    id: r.id,
    amountCents: r.amount_cents,
    direction: r.direction,
    category: r.category as CategoryKey,
    merchant: r.merchant,
    note: r.note,
    occurredAt: r.occurred_at,
    source: r.source,
    updatedAt: r.updated_at,
    syncStatus: r.sync_status,
  };
}

export type NewTransaction = {
  amountCents: number;
  direction: 'in' | 'out';
  category: CategoryKey;
  merchant: string;
  note?: string;
  occurredAt?: string; 
  source?: Transaction['source'];
};


export async function addTransaction(input: NewTransaction): Promise<Transaction> {
  const db = await getDb();
  const now = new Date().toISOString();

  const tx: Transaction = {
    id: Crypto.randomUUID(),
    amountCents: Math.round(input.amountCents),
    direction: input.direction,
    category: input.category,
    merchant: input.merchant.trim(),
    note: input.note?.trim() || null,
    occurredAt: input.occurredAt ?? now,
    source: input.source ?? 'manual',
    updatedAt: now,
    syncStatus: 'pending',
  };

  await db.withExclusiveTransactionAsync(async (txn) => {
    await txn.runAsync(
      `INSERT INTO transactions
         (id, amount_cents, direction, category, merchant, note, occurred_at, source, updated_at, sync_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [tx.id, tx.amountCents, tx.direction, tx.category, tx.merchant, tx.note, tx.occurredAt, tx.source, tx.updatedAt],
    );
    await enqueue(txn, 'transaction', tx.id, 'upsert', tx);
  });

  return tx;
}

export async function getTransaction(id: string): Promise<Transaction | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<TransactionRow>(
    'SELECT * FROM transactions WHERE id = ? AND deleted = 0',
    [id],
  );
  return row ? fromRow(row) : null;
}


export async function updateTransaction(
  id: string,
  changes: Partial<Omit<NewTransaction, 'source'>>,
): Promise<Transaction> {
  const current = await getTransaction(id);
  if (!current) throw new Error(`Transaction ${id} not found`);

  const updated: Transaction = {
    ...current, 
    ...changes, 
    merchant: (changes.merchant ?? current.merchant).trim(),
    note: changes.note === undefined ? current.note : changes.note.trim() || null,
    updatedAt: new Date().toISOString(), // newer time wins in sync (last-write-wins)
    syncStatus: 'pending',
  };

  const db = await getDb();
  await db.withExclusiveTransactionAsync(async (txn) => {
    await txn.runAsync(
      `UPDATE transactions
          SET amount_cents = ?, direction = ?, category = ?, merchant = ?, note = ?,
              occurred_at = ?, updated_at = ?, sync_status = 'pending'
        WHERE id = ?`,
      [updated.amountCents, updated.direction, updated.category, updated.merchant, updated.note,
       updated.occurredAt, updated.updatedAt, id],
    );
    await enqueue(txn, 'transaction', id, 'upsert', updated);
  });
  return updated;
}


export async function deleteTransaction(id: string): Promise<void> {
  const db = await getDb();
  const now = new Date().toISOString();
  await db.withExclusiveTransactionAsync(async (txn) => {
    const res = await txn.runAsync(
      `UPDATE transactions SET deleted = 1, updated_at = ?, sync_status = 'pending' WHERE id = ? AND deleted = 0`,
      [now, id],
    );
    if (res.changes === 0) return; // already deleted or never existed: nothing to sync
    await enqueue(txn, 'transaction', id, 'delete', { id, updatedAt: now });
  });
}


export async function listTransactions(limit = 50): Promise<Transaction[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<TransactionRow>(
    `SELECT * FROM transactions WHERE deleted = 0 ORDER BY occurred_at DESC LIMIT ?`,
    [limit],
  );
  return rows.map(fromRow);
}

export async function countPending(): Promise<number> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ n: number }>('SELECT COUNT(*) AS n FROM sync_queue');
  return row?.n ?? 0;
}