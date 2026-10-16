import { getDb } from './client';
import type { Entity, Op } from './outbox';

export type QueueItem = {
  id: number;
  entity: Entity;
  entityId: string;
  op: Op;
  payload: Record<string, unknown>;
  attempts: number;
};

const TABLE: Record<Entity, string> = { transaction: 'transactions', budget: 'budgets', bill: 'bills' };

export async function listQueue(limit = 200): Promise<QueueItem[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ id: number; entity: Entity; entity_id: string; op: Op; payload: string; attempts: number }>(
    'SELECT id, entity, entity_id, op, payload, attempts FROM sync_queue ORDER BY id ASC LIMIT ?',
    [limit],
  );
  return rows.map((r) => ({
    id: r.id,
    entity: r.entity,
    entityId: r.entity_id,
    op: r.op,
    payload: JSON.parse(r.payload) as Record<string, unknown>,
    attempts: r.attempts,
  }));
}

/** The cloud accepted this change: drop it from the queue and mark the row synced if it hasn't changed since. */
export async function completeQueueItem(item: QueueItem): Promise<void> {
  const db = await getDb();
  const updatedAt = typeof item.payload.updatedAt === 'string' ? item.payload.updatedAt : '';
  await db.withExclusiveTransactionAsync(async (txn) => {
    await txn.runAsync('DELETE FROM sync_queue WHERE id = ?', [item.id]);
    await txn.runAsync(`UPDATE ${TABLE[item.entity]} SET sync_status = 'synced' WHERE id = ? AND updated_at = ?`, [item.entityId, updatedAt]);
  });
}

export async function failQueueItem(item: QueueItem, error: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('UPDATE sync_queue SET attempts = attempts + 1, last_error = ? WHERE id = ?', [error.slice(0, 300), item.id]);
}

type Remote = Record<string, unknown>;

const str = (v: unknown, fallback = '') => (typeof v === 'string' ? v : fallback);
const num = (v: unknown, fallback = 0) => (typeof v === 'number' ? v : fallback);

/**
 * Applies one document from the cloud. Last-write-wins: the newer updatedAt survives.
 * Writes straight to the tables (no queue entry), so remote changes are never re-uploaded.
 * Returns true if the local row changed.
 */
export async function applyRemote(entity: Entity, data: Remote): Promise<boolean> {
  const id = str(data.id);
  const updatedAt = str(data.updatedAt);
  if (!id || !updatedAt) return false;
  const deleted = data.deleted === true ? 1 : 0;
  const db = await getDb();

  const existing = await db.getFirstAsync<{ updated_at: string }>(`SELECT updated_at FROM ${TABLE[entity]} WHERE id = ?`, [id]);
  if (existing && existing.updated_at >= updatedAt) return false; // local is same or newer

  if (entity === 'transaction') {
    if (!existing && deleted) return false; // nothing to delete, nothing to create
    if (deleted) {
      await db.runAsync(`UPDATE transactions SET deleted = 1, updated_at = ?, sync_status = 'synced' WHERE id = ?`, [updatedAt, id]);
      return true;
    }
    await db.runAsync(
      `INSERT INTO transactions (id, amount_cents, direction, category, merchant, note, occurred_at, source, updated_at, deleted, sync_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 'synced')
       ON CONFLICT(id) DO UPDATE SET amount_cents = excluded.amount_cents, direction = excluded.direction,
         category = excluded.category, merchant = excluded.merchant, note = excluded.note,
         occurred_at = excluded.occurred_at, source = excluded.source, updated_at = excluded.updated_at,
         deleted = 0, sync_status = 'synced'`,
      [
        id,
        num(data.amountCents, 1),
        data.direction === 'in' ? 'in' : 'out',
        str(data.category, 'other'),
        str(data.merchant, 'Unknown'),
        typeof data.note === 'string' ? data.note : null,
        str(data.occurredAt, updatedAt),
        ['manual', 'receipt', 'paste'].includes(str(data.source)) ? str(data.source) : 'manual',
        updatedAt,
      ],
    );
    return true;
  }

  if (entity === 'budget') {
    if (!existing && deleted) return false;
    if (deleted) {
      await db.runAsync(`UPDATE budgets SET deleted = 1, updated_at = ?, sync_status = 'synced' WHERE id = ?`, [updatedAt, id]);
      return true;
    }
    // One budget per category: if another device made the same category, keep the newer one's values.
    await db.runAsync(
      `INSERT INTO budgets (id, category, limit_cents, updated_at, deleted, sync_status)
       VALUES (?, ?, ?, ?, 0, 'synced')
       ON CONFLICT(category) DO UPDATE SET limit_cents = excluded.limit_cents, updated_at = excluded.updated_at,
         deleted = 0, sync_status = 'synced'
       WHERE excluded.updated_at > budgets.updated_at`,
      [id, str(data.category, 'other'), Math.max(num(data.limitCents, 1), 1), updatedAt],
    );
    return true;
  }

  // bill
  if (!existing && deleted) return false;
  if (deleted) {
    await db.runAsync(`UPDATE bills SET deleted = 1, updated_at = ?, sync_status = 'synced' WHERE id = ?`, [updatedAt, id]);
    return true;
  }
  await db.runAsync(
    `INSERT INTO bills (id, name, category, amount_cents, due_day, remind_days_before, last_paid_month, updated_at, deleted, sync_status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 'synced')
     ON CONFLICT(id) DO UPDATE SET name = excluded.name, category = excluded.category, amount_cents = excluded.amount_cents,
       due_day = excluded.due_day, remind_days_before = excluded.remind_days_before,
       last_paid_month = excluded.last_paid_month, updated_at = excluded.updated_at, deleted = 0, sync_status = 'synced'`,
    [
      id,
      str(data.name, 'Bill'),
      str(data.category, 'bills'),
      Math.max(num(data.amountCents, 1), 1),
      Math.min(Math.max(num(data.dueDay, 1), 1), 31),
      num(data.remindDaysBefore, 2),
      typeof data.lastPaidMonth === 'string' ? data.lastPaidMonth : null,
      updatedAt,
    ],
  );
  return true;
}

/** Forgets the "last pulled" markers, so the next sync re-downloads everything from the cloud. */
export async function resetSyncState(): Promise<void> {
  const db = await getDb();
  await db.execAsync(`DELETE FROM kv WHERE key LIKE 'lastPull:%'`);
}