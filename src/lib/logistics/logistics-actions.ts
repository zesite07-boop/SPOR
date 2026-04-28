import type { LogisticsRetreatStatus } from "@/lib/db/schema";
import { db } from "@/lib/db/schema";

export async function setTaskDone(taskId: string, done: boolean) {
  if (!db) return;
  const t = await db.logisticsTasks.get(taskId);
  if (!t) return;
  await db.logisticsTasks.put({ ...t, done, updatedAt: Date.now() });
}

export async function setRetreatStatus(retreatId: string, status: LogisticsRetreatStatus) {
  if (!db) return;
  await db.logisticsMeta.put({ retreatId, status, updatedAt: Date.now() });
}

/** Réordonne les tâches planning d’un jour (indices `sortOrder` = 0..n). */
export async function reorderPlanningDay(retreatId: string, dayIndex: number, orderedIds: string[]) {
  const dexie = db;
  if (!dexie) return;
  const now = Date.now();
  await dexie.transaction("rw", dexie.logisticsTasks, async () => {
    for (let i = 0; i < orderedIds.length; i++) {
      const id = orderedIds[i]!;
      const t = await dexie.logisticsTasks.get(id);
      if (!t || t.retreatId !== retreatId || t.section !== "planning" || t.dayIndex !== dayIndex) continue;
      await dexie.logisticsTasks.put({ ...t, sortOrder: i, updatedAt: now });
    }
  });
}

export async function updateParticipantRoom(id: string, roomLabel: string) {
  if (!db) return;
  const p = await db.logisticsParticipants.get(id);
  if (!p) return;
  await db.logisticsParticipants.put({ ...p, roomLabel, updatedAt: Date.now() });
}

export async function updateParticipantTransfer(id: string, transferStatus: string) {
  if (!db) return;
  const p = await db.logisticsParticipants.get(id);
  if (!p) return;
  await db.logisticsParticipants.put({ ...p, transferStatus, updatedAt: Date.now() });
}

export async function updateParticipantOracle(id: string, patch: { oracleNote?: string; birthDate?: string; name?: string }) {
  if (!db) return;
  const p = await db.logisticsParticipants.get(id);
  if (!p) return;
  await db.logisticsParticipants.put({
    ...p,
    ...patch,
    updatedAt: Date.now(),
  });
}
