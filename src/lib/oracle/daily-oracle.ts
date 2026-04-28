import { getSunSign } from "@/lib/cosmic/sun-sign";
import { DAY_NUMBER_THEMES, personalDayNumber } from "@/lib/cosmic/numerology";
import { getMajorById, type MajorArcana } from "./tarot-major";

export type ThreeCardRole = "energy" | "advice" | "potential";

export const CARD_ROLES: { key: ThreeCardRole; label: string }[] = [
  { key: "energy", label: "Énergie du jour" },
  { key: "advice", label: "Conseil" },
  { key: "potential", label: "Potentiel" },
];

/** Tirage de 3 arcanes distincts (0–21). */
export function drawThreeCards(rng: () => number = Math.random): [number, number, number] {
  const pool = Array.from({ length: 22 }, (_, i) => i);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return [pool[0], pool[1], pool[2]];
}

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Tirage reproductible pour une date donnée (optionnel). */
export function drawSeededForDate(date: Date): [number, number, number] {
  const seed =
    date.getFullYear() * 10_000 +
    (date.getMonth() + 1) * 100 +
    date.getDate() +
    42;
  return drawThreeCards(mulberry32(seed));
}

export function buildOracleInterpretation(
  date: Date,
  cards: [number, number, number]
): string {
  const [e, a, p] = cards.map(getMajorById);
  const sun = getSunSign(date);
  const dayNum = personalDayNumber(date);
  const theme = DAY_NUMBER_THEMES[dayNum] ?? "présence au présent";

  return [
    `Sous le Soleil en ${sun}, ton nombre du jour (${dayNum}) invite ${theme}.`,
    `${e.name} (+ ${e.keyword}) colore ton élan : ${e.gentle}`,
    `Pour avancer : ${a.name} suggère ${a.keyword} — ${a.gentle}`,
    `Le champ du possible : ${p.name} ouvre ${p.keyword} ; ${p.gentle}`,
  ].join(" ");
}

export function cardsWithRoles(cards: [number, number, number]): {
  role: ThreeCardRole;
  label: string;
  card: MajorArcana;
}[] {
  return CARD_ROLES.map((r, i) => ({
    role: r.key,
    label: r.label,
    card: getMajorById(cards[i]),
  }));
}
