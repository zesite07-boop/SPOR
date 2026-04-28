import type { OracleSession, OracleSessionDrawType } from "@/lib/db/schema";
import { db } from "@/lib/db/schema";

export const LOCAL_PROFILE_ID = "padma-local";

export async function saveOracleSession(payload: Omit<OracleSession, "id" | "drawnAt"> & { id?: string }) {
  if (!db) return null;
  const id = payload.id ?? crypto.randomUUID();
  const row: OracleSession = {
    id,
    drawType: payload.drawType,
    title: payload.title,
    cardIds: payload.cardIds,
    positionLabels: payload.positionLabels,
    interpretation: payload.interpretation,
    meta: payload.meta,
    drawnAt: Date.now(),
  };
  await db.oracleSessions.add(row);
  return id;
}

export async function listOracleSessions(limit = 200): Promise<OracleSession[]> {
  if (!db) return [];
  return db.oracleSessions.orderBy("drawnAt").reverse().limit(limit).toArray();
}

export async function deleteOracleSession(id: string) {
  if (!db) return;
  await db.oracleSessions.delete(id);
}

export function sessionTitleForKind(kind: OracleSessionDrawType): string {
  const map: Record<OracleSessionDrawType, string> = {
    chakra_full: "Roue des chakras (7)",
    chakra_focus: "Chakras — Corps · Cœur · Esprit",
    life_path: "Chemin de vie & trois temps",
    monthly: "Les quatre vents du mois",
    retreat: "Cinq portes de la retraite",
    free: "Tirage libre",
  };
  return map[kind];
}
