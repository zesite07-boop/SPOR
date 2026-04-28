import { getMoonDayInfo, type MoonDayInfo } from "./lunar";

export type TransitHighlight = {
  dateLabel: string;
  /** ISO date locale YYYY-MM-DD */
  isoDate: string;
  title: string;
  detail: string;
  accent: "moon" | "mercury" | "sun";
};

function fmt(d: Date): string {
  return d.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" });
}

function toIsoLocal(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Mercure rétrograde — fenêtres approximatives (UTC) mises à jour périodiquement ; offline-friendly. */
const MERCURY_RETRO_PERIODS: { start: string; end: string }[] = [
  { start: "2025-11-09", end: "2025-11-29" },
  { start: "2026-02-26", end: "2026-03-20" },
  { start: "2026-06-29", end: "2026-07-23" },
  { start: "2026-10-24", end: "2026-11-13" },
  { start: "2027-02-23", end: "2027-03-17" },
];

function parseIso(s: string): number {
  return new Date(s + "T12:00:00").getTime();
}

export function isMercuryRetrograde(d: Date): boolean {
  const t = d.getTime();
  for (const p of MERCURY_RETRO_PERIODS) {
    if (t >= parseIso(p.start) && t <= parseIso(p.end)) return true;
  }
  return false;
}

/** Une seule carte si nous sommes dans une période — évite les doublons jour par jour. */
export function getMercuryRetroHighlight(now: Date): TransitHighlight | null {
  const t = now.getTime();
  for (const p of MERCURY_RETRO_PERIODS) {
    if (t >= parseIso(p.start) && t <= parseIso(p.end)) {
      return {
        dateLabel: fmt(now),
        isoDate: toIsoLocal(now),
        title: "Mercure rétrograde — patience & relecture",
        detail: `Période approximative ${p.start} → ${p.end}. Ralentis les signatures, clarifie tes mots, révise avec tendresse.`,
        accent: "mercury",
      };
    }
  }
  return null;
}

/** Changements de signe solaire « sensibles » sur la fenêtre (jour exact approximatif). */
const SUN_INGRESS: { m: number; d: number; sign: string }[] = [
  { m: 3, d: 20, sign: "Printemps — Soleil vers les Bélier" },
  { m: 4, d: 20, sign: "Soleil en Taureau — ancrage des sens" },
  { m: 5, d: 21, sign: "Soleil en Gémeaux — échanges & curiosité" },
  { m: 6, d: 21, sign: "Solstice — Soleil en Cancer" },
  { m: 7, d: 23, sign: "Soleil en Lion — rayonnement du cœur" },
  { m: 8, d: 23, sign: "Soleil en Vierge — soin & précision douce" },
  { m: 9, d: 23, sign: "Équinoxe — Soleil en Balance" },
  { m: 10, d: 23, sign: "Soleil en Scorpion — profondeur & vérité" },
  { m: 11, d: 22, sign: "Soleil en Sagittaire — horizon & foi" },
  { m: 12, d: 21, sign: "Solstice — Soleil en Capricorne" },
];

function sunIngressInRange(d: Date): TransitHighlight | null {
  const m = d.getMonth() + 1;
  const day = d.getDate();
  const hit = SUN_INGRESS.find((x) => x.m === m && x.d === day);
  if (!hit) return null;
  return {
    dateLabel: fmt(d),
    isoDate: toIsoLocal(d),
    title: hit.sign,
    detail: "Un souffle collectif à honorer dans tes rituels et intentions.",
    accent: "sun",
  };
}

function moonHighlight(info: MoonDayInfo): TransitHighlight | null {
  if (info.phase !== "new" && info.phase !== "full") return null;
  const title = info.phase === "new" ? "Nouvelle lune — seuil d’intentions" : "Pleine lune — illumination & lâcher-prise";
  const detail =
    info.phase === "new"
      ? "Temps propice aux graines intérieures, au silence et à l’écriture sacrée."
      : "Temps de célébration douce, de gratitude et de relâchement conscient.";
  return {
    dateLabel: fmt(info.date),
    isoDate: toIsoLocal(info.date),
    title,
    detail,
    accent: "moon",
  };
}

/**
 * Événements à mettre en avant sur les `days` prochains jours (lune nouvelle/pleine, ingress solaires).
 * Mercure : une seule entrée si la période est active en ce moment.
 */
export function getMajorTransitHighlights(days: number): TransitHighlight[] {
  const list: TransitHighlight[] = [];
  const mercury = getMercuryRetroHighlight(new Date());
  if (mercury) list.push(mercury);

  const start = new Date();
  start.setHours(12, 0, 0, 0);

  for (let i = 0; i < days; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);

    const moon = getMoonDayInfo(d);
    const mh = moonHighlight(moon);
    if (mh) list.push(mh);

    const ingress = sunIngressInRange(d);
    if (ingress) list.push(ingress);

  }

  const seen = new Set<string>();
  return list.filter((t) => {
    const k = `${t.isoDate}-${t.title}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}
