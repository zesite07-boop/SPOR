import type { OracleDayDraw } from "@/lib/db/schema";
import { db } from "@/lib/db/schema";

function todayId(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export async function saveOracleDraw(record: Omit<OracleDayDraw, "id"> & { id?: string }) {
  if (!db) return;
  const id = record.id ?? todayId();
  await db.oracleDraws.put({
    id,
    cardIds: record.cardIds,
    interpretation: record.interpretation,
    drawnAt: record.drawnAt,
  });
}

export async function loadTodayDraw(): Promise<OracleDayDraw | undefined> {
  if (!db) return undefined;
  return db.oracleDraws.get(todayId());
}

/** Derniers tirages enregistrés (max 7), du plus récent au plus ancien. */
export async function loadOracleHistory(limit = 7): Promise<OracleDayDraw[]> {
  if (!db) return [];
  const rows = await db.oracleDraws.orderBy("drawnAt").reverse().limit(limit).toArray();
  return rows;
}
