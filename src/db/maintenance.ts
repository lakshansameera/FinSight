import { getDb } from './client';

/** Removes everything stored on this phone. Used by Settings -> Delete local data. */
export async function clearAllData(): Promise<void> {
  const db = await getDb();
  await db.withExclusiveTransactionAsync(async (txn) => {
    await txn.execAsync('DELETE FROM sync_queue; DELETE FROM transactions; DELETE FROM budgets; DELETE FROM bills;');
  });
}

export async function dataCounts() {
  const db = await getDb();
  const count = async (table: string) =>
    (await db.getFirstAsync<{ n: number }>(`SELECT COUNT(*) AS n FROM ${table} WHERE deleted = 0`))?.n ?? 0;
  return { transactions: await count('transactions'), budgets: await count('budgets'), bills: await count('bills') };
}