import { collection, doc, getDocs, query, setDoc, where } from 'firebase/firestore';
import { getFirestoreDb } from '@/config/firebase';
import { getKv, setKv } from '@/db/kvRepo';
import { applyRemote, completeQueueItem, failQueueItem, listQueue } from '@/db/syncRepo';
import type { Entity } from '@/db/outbox';

const COLLECTION: Record<Entity, string> = { transaction: 'transactions', budget: 'budgets', bill: 'bills' };
const ENTITIES: Entity[] = ['transaction', 'budget', 'bill'];

export type SyncResult = { pushed: number; pulled: number; failed: number; changedLocal: boolean };

/** Fields that live only on the phone are not uploaded. */
function toCloud(payload: Record<string, unknown>, deleted: boolean) {
  const { syncStatus: _drop, ...rest } = payload;
  return { ...rest, deleted };
}

/**
 * One full sync pass for a signed-in user:
 *   1. push every queued change (oldest first) to users/{uid}/{collection}/{id}
 *   2. pull anything newer than the last pull and merge it (last-write-wins on updatedAt)
 * Throws if the network is down, so the caller can show the "offline" state.
 */
export async function syncAll(uid: string): Promise<SyncResult> {
  const result: SyncResult = { pushed: 0, pulled: 0, failed: 0, changedLocal: false };
  const db = getFirestoreDb();

  // ---- push ----
  const queue = await listQueue();
  for (const item of queue) {
    try {
      const ref = doc(db, 'users', uid, COLLECTION[item.entity], item.entityId);
      if (item.op === 'delete') {
        await setDoc(ref, { id: item.entityId, updatedAt: item.payload.updatedAt, deleted: true }, { merge: true });
      } else {
        await setDoc(ref, toCloud(item.payload, false));
      }
      await completeQueueItem(item);
      result.pushed++;
    } catch (e) {
      await failQueueItem(item, String((e as Error).message ?? e));
      result.failed++;
      if (isNetworkError(e)) throw e; // stop early: we're offline
    }
  }

  // ---- pull ----
  for (const entity of ENTITIES) {
    const key = `lastPull:${uid}:${entity}`;
    const since = (await getKv(key)) ?? '';
    const snap = await getDocs(query(collection(db, 'users', uid, COLLECTION[entity]), where('updatedAt', '>', since)));
    let newest = since;
    for (const d of snap.docs) {
      const data = d.data() as Record<string, unknown>;
      if (await applyRemote(entity, { ...data, id: data.id ?? d.id })) {
        result.pulled++;
        result.changedLocal = true;
      }
      const u = typeof data.updatedAt === 'string' ? data.updatedAt : '';
      if (u > newest) newest = u;
    }
    if (newest !== since) await setKv(key, newest);
  }

  return result;
}

export function isNetworkError(e: unknown): boolean {
  const code = (e as { code?: string } | null)?.code ?? '';
  const msg = String((e as Error | null)?.message ?? '');
  return code === 'unavailable' || code === 'deadline-exceeded' || /network|offline|failed to get document|timed out/i.test(msg);
}