import type { ReservationRecord } from "@/lib/db/schema";
import { db } from "@/lib/db/schema";

export async function saveReservationDraft(row: ReservationRecord) {
  if (!db) return;
  await db.reservations.put(row);
}

export async function updateReservation(id: string, patch: Partial<ReservationRecord>) {
  if (!db) return;
  const prev = await db.reservations.get(id);
  if (!prev) return;
  await db.reservations.put({ ...prev, ...patch, updatedAt: Date.now() });
}

export async function getReservation(id: string) {
  if (!db) return undefined;
  return db.reservations.get(id);
}
