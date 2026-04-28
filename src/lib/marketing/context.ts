import type { RetreatDefinition } from "@/lib/reservation/catalog";
import { listUpcomingRetreats } from "@/lib/reservation/catalog";
import { db } from "@/lib/db/schema";
import { getMajorById } from "@/lib/oracle/tarot-major";
import { getSunSign } from "@/lib/cosmic/sun-sign";
import { personalDayNumber, DAY_NUMBER_THEMES } from "@/lib/cosmic/numerology";
import { moonPhaseLabelFr } from "@/lib/marketing/moon-phase";

export type MarketingOracleHint = {
  energyCardName: string;
  energyKeyword: string;
  adviceCardName?: string;
};

export type MarketingContext = {
  dateIso: string;
  dateLabelFr: string;
  moonPhase: string;
  sunSign: string;
  personalDayNumber: number;
  personalDayTheme: string;
  nextRetreat: RetreatDefinition | null;
  oracle: MarketingOracleHint | null;
};

function formatDateFr(d: Date): string {
  return d.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function todayKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export async function buildMarketingContext(now = new Date()): Promise<MarketingContext> {
  const dateIso = todayKey(now);
  const sunSign = getSunSign(now);
  const dayNum = personalDayNumber(now);
  const theme = DAY_NUMBER_THEMES[dayNum] ?? "présence au présent";

  let oracle: MarketingOracleHint | null = null;
  const dexie = db;
  if (dexie) {
    const draw = await dexie.oracleDraws.get(dateIso);
    if (draw && draw.cardIds?.length >= 2) {
      const e = getMajorById(draw.cardIds[0]);
      const a = getMajorById(draw.cardIds[1]);
      oracle = {
        energyCardName: e.name,
        energyKeyword: e.keyword,
        adviceCardName: a.name,
      };
    }
  }

  const upcoming = listUpcomingRetreats(now);
  const nextRetreat = upcoming[0] ?? null;

  return {
    dateIso,
    dateLabelFr: formatDateFr(now),
    moonPhase: moonPhaseLabelFr(now),
    sunSign,
    personalDayNumber: dayNum,
    personalDayTheme: theme,
    nextRetreat,
    oracle,
  };
}
