import type { SQLiteDatabase } from 'expo-sqlite';

export type Entity = 'transaction' | 'budget' | 'bill';
export type Op = 'upsert' | 'delete';


export async function enqueue(txn: SQLiteDatabase, entity: Entity, entityId: string, op: Op, payload: object) {
  await txn.runAsync(
    `INSERT INTO sync_queue (entity, entity_id, op, payload, created_at) VALUES (?, ?, ?, ?, ?)`,
    [entity, entityId, op, JSON.stringify(payload), new Date().toISOString()],
  );
}