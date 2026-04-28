import { getSunSign } from "@/lib/cosmic/sun-sign";
import { lifePathNumber, soulUrgeNumber } from "./numerology-extended";
import { getMajorById } from "./tarot-major";
import type { OracleSession } from "@/lib/db/schema";

export type OraclePortrait = {
  sunSign: string | null;
  lifePath: number | null;
  soulUrge: number | null;
  dominantArcanaId: number | null;
  dominantLabel: string | null;
};

export function computeOraclePortrait(
  birth: Date | null,
  fullName: string | null | undefined,
  sessions: OracleSession[]
): OraclePortrait {
  const sunSign = birth ? getSunSign(birth) : null;
  const lifePath = birth ? lifePathNumber(birth) : null;
  const soulUrge = fullName?.trim() ? soulUrgeNumber(fullName.trim()) : null;

  let dominantArcanaId: number | null = null;
  let dominantLabel: string | null = null;
  if (sessions.length > 0) {
    const counts = new Map<number, number>();
    for (const s of sessions) {
      for (const id of s.cardIds) {
        counts.set(id, (counts.get(id) ?? 0) + 1);
      }
    }
    let best = -1;
    let bestId = 0;
    for (const [id, c] of counts) {
      if (c > best) {
        best = c;
        bestId = id;
      }
    }
    if (best > 0) {
      dominantArcanaId = bestId;
      dominantLabel = getMajorById(bestId).name;
    }
  }

  return {
    sunSign,
    lifePath,
    soulUrge,
    dominantArcanaId,
    dominantLabel,
  };
}
