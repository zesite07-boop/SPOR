import type { OracleSessionDrawType } from "@/lib/db/schema";
import { getSunSign } from "@/lib/cosmic/sun-sign";
import { lifePathNumber, LIFE_PATH_THEMES, soulUrgeNumber, SOUL_URGE_THEMES } from "./numerology-extended";
import { getMajorById } from "./tarot-major";

export const CHAKRA_LABELS_FULL = [
  "Racine — ancrage",
  "Sacré — flux créatif",
  "Plexus — volonté lumineuse",
  "Cœur — accueil",
  "Gorge — parole vraie",
  "3e œil — vision intérieure",
  "Couronne — union",
] as const;

export const CHAKRA_LABELS_FOCUS = ["Corps — ancrage sensoriel", "Cœur — réceptivité", "Esprit — guidance"] as const;

export const MONTHLY_LABELS = ["Souffle du mois", "Friction féconde", "Ressource cachée", "Grâce qui vient"] as const;

export const RETREAT_LABELS = [
  "Intention sacrée",
  "Corps temple",
  "Relation au monde",
  "Âme voyageuse",
  "Intégration terre",
] as const;

function rng(): number {
  return Math.random();
}

/** Tirage sans remise parmi les 22 majeurs. */
export function drawUniqueMajors(count: number, random: () => number = rng): number[] {
  const pool = Array.from({ length: 22 }, (_, i) => i);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, Math.min(count, 22));
}

export type ChakraDrawResult = {
  kind: Extract<OracleSessionDrawType, "chakra_full" | "chakra_focus">;
  labels: readonly string[];
  cardIds: number[];
};

export function drawChakra(mode: "full" | "focus", random: () => number = rng): ChakraDrawResult {
  if (mode === "focus") {
    return {
      kind: "chakra_focus",
      labels: CHAKRA_LABELS_FOCUS,
      cardIds: drawUniqueMajors(3, random),
    };
  }
  return {
    kind: "chakra_full",
    labels: CHAKRA_LABELS_FULL,
    cardIds: drawUniqueMajors(7, random),
  };
}

export type LifePathDrawResult = {
  kind: "life_path";
  cardIds: [number, number, number];
  lifePath: number;
  labels: ["Passé intérieur", "Présent vivant", "Sommet possible"];
};

export function drawLifePath(birth: Date, random: () => number = rng): LifePathDrawResult {
  const lp = lifePathNumber(birth);
  const cards = drawUniqueMajors(3, random) as [number, number, number];
  return {
    kind: "life_path",
    cardIds: cards,
    lifePath: lp,
    labels: ["Passé intérieur", "Présent vivant", "Sommet possible"],
  };
}

export type MonthlyDrawResult = {
  kind: "monthly";
  cardIds: number[];
  labels: typeof MONTHLY_LABELS;
};

export function drawMonthly(random: () => number = rng): MonthlyDrawResult {
  return {
    kind: "monthly",
    labels: MONTHLY_LABELS,
    cardIds: drawUniqueMajors(4, random),
  };
}

export type RetreatDrawResult = {
  kind: "retreat";
  cardIds: number[];
  labels: typeof RETREAT_LABELS;
};

export function drawRetreat(random: () => number = rng): RetreatDrawResult {
  return {
    kind: "retreat",
    labels: RETREAT_LABELS,
    cardIds: drawUniqueMajors(5, random),
  };
}

export type FreeDrawResult = {
  kind: "free";
  cardIds: number[];
};

export function drawFree(count: number, random: () => number = rng): FreeDrawResult {
  const n = Math.max(1, Math.min(7, Math.floor(count)));
  return { kind: "free", cardIds: drawUniqueMajors(n, random) };
}

/** Texte d’interprétation — ton poétique, toujours positif. */
export function interpretChakra(result: ChakraDrawResult): string {
  const parts = result.cardIds.map((id, i) => {
    const c = getMajorById(id);
    return `${result.labels[i]} : ${c.name} invite ${c.keyword} — ${c.gentle}`;
  });
  return [
    "Ta roue énergétique respire avec tendresse. Chaque centre murmure une nuance de ton histoire.",
    ...parts,
    "Laisse l’ordre des cartes être une caresse, pas une hiérarchie : tout circule dans le temps long.",
  ].join(" ");
}

export function interpretLifePath(
  result: LifePathDrawResult,
  birth: Date,
  displayName?: string | null
): string {
  const lpTheme = LIFE_PATH_THEMES[result.lifePath] ?? LIFE_PATH_THEMES[9];
  const sun = getSunSign(birth);
  const soul = displayName ? soulUrgeNumber(displayName) : null;
  const soulLine =
    soul != null
      ? `Ton nombre d’âme (${soul}) murmure : ${SOUL_URGE_THEMES[soul] ?? "tu cherches l’unité intérieure."}`
      : "Ton prénom peut enrichir le nombre d’âme — ajoute-le dans ton profil oracle.";
  const [p0, p1, p2] = result.cardIds.map(getMajorById);
  return [
    `Chemin de vie ${result.lifePath} : tu es ${lpTheme}`,
    `Soleil né en ${sun} : ta couleur de naissance colore ce chemin sans l’enfermer.`,
    soulLine,
    `${result.labels[0]} — ${p0.name} : ${p0.gentle}`,
    `${result.labels[1]} — ${p1.name} : ${p1.gentle}`,
    `${result.labels[2]} — ${p2.name} : ${p2.gentle}`,
    "Ce trio est une boussole douce : respire, et laisse les étapes se déposer.",
  ].join(" ");
}

export function interpretMonthly(result: MonthlyDrawResult, monthLabel: string): string {
  const lines = result.cardIds.map((id, i) => {
    const c = getMajorById(id);
    return `${result.labels[i]} (${monthLabel}) : ${c.name} — ${c.keyword}. ${c.gentle}`;
  });
  return [`Les quatre vents du mois ${monthLabel} respirent ensemble :`, ...lines].join(" ");
}

export function interpretRetreat(result: RetreatDrawResult): string {
  const lines = result.cardIds.map((id, i) => {
    const c = getMajorById(id);
    return `${result.labels[i]} : ${c.name} t’offre ${c.keyword} — ${c.gentle}`;
  });
  return [
    "Ta retraite est un passage : ces cinq regards t’accompagnent sans te presser.",
    ...lines,
    "Prends ce qui résonne ; le reste est déjà une graine pour plus tard.",
  ].join(" ");
}

export function interpretFree(cardIds: number[], intention?: string): string {
  const intro = intention?.trim()
    ? `Autour de ton intention (« ${intention.trim()} »), les arcanes se répondent ainsi :`
    : "Les arcanes offrent cette mosaïque à ton moment présent :";
  const body = cardIds.map((id) => {
    const c = getMajorById(id);
    return `${c.name} — ${c.keyword} ; ${c.gentle}`;
  });
  return [intro, ...body].join(" ");
}
