/** Calculs lunaires locaux (aucune API) — synode moyenne ~29,53 jours. */

const SYNODIC_DAYS = 29.530588853;
/** Nouvelle lune de référence (UTC) proche de l’algorithme courant « phase lunaire ». */
const REF_NEW_MOON_UTC = Date.UTC(2000, 0, 6, 18, 14, 0);

export type MoonPhaseKind =
  | "new"
  | "waxing_crescent"
  | "first_quarter"
  | "waxing_gibbous"
  | "full"
  | "waning_gibbous"
  | "last_quarter"
  | "waning_crescent";

export type MoonDayInfo = {
  date: Date;
  /** Âge lunaire en jours [0, synodique). */
  ageDays: number;
  /** 0–1, approximation de la partie éclairée visible. */
  illumination: number;
  phase: MoonPhaseKind;
  labelFr: string;
};

const PHASE_LABELS: Record<MoonPhaseKind, string> = {
  new: "Nouvelle lune",
  waxing_crescent: "Premier croissant",
  first_quarter: "Premier quartier",
  waxing_gibbous: "Gibbeuse croissante",
  full: "Pleine lune",
  waning_gibbous: "Gibbeuse décroissante",
  last_quarter: "Dernier quartier",
  waning_crescent: "Dernier croissant",
};

function normalizeAgeDays(tMs: number): number {
  let age = (tMs - REF_NEW_MOON_UTC) / 86_400_000;
  age %= SYNODIC_DAYS;
  if (age < 0) age += SYNODIC_DAYS;
  return age;
}

function kindFromAge(age: number): MoonPhaseKind {
  const u = age / SYNODIC_DAYS;
  if (u < 0.0625) return "new";
  if (u < 0.1875) return "waxing_crescent";
  if (u < 0.3125) return "first_quarter";
  if (u < 0.4375) return "waxing_gibbous";
  if (u < 0.5625) return "full";
  if (u < 0.6875) return "waning_gibbous";
  if (u < 0.8125) return "last_quarter";
  if (u < 0.9375) return "waning_crescent";
  return "new";
}

/** Approximation visuelle de la fraction illuminée (0 = nouvelle, 1 = pleine). */
function illuminationFromAge(age: number): number {
  return (1 - Math.cos((2 * Math.PI * age) / SYNODIC_DAYS)) / 2;
}

export function getMoonDayInfo(date: Date): MoonDayInfo {
  const utc = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0);
  const ageDays = normalizeAgeDays(utc);
  const phase = kindFromAge(ageDays);
  return {
    date: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
    ageDays,
    illumination: illuminationFromAge(ageDays),
    phase,
    labelFr: PHASE_LABELS[phase],
  };
}

/** Fenêtre glissante : `days` jours à partir d’aujourd’hui (date locale). */
export function getMoonCalendarFromToday(days: number): MoonDayInfo[] {
  const out: MoonDayInfo[] = [];
  const start = new Date();
  start.setHours(12, 0, 0, 0);
  for (let i = 0; i < days; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    out.push(getMoonDayInfo(d));
  }
  return out;
}

/** Détecte nouvelle / pleine sur une journée (pour surbrillance calendrier). */
export function isMajorMoonDay(info: MoonDayInfo): "new" | "full" | null {
  if (info.phase === "new") return "new";
  if (info.phase === "full") return "full";
  return null;
}
