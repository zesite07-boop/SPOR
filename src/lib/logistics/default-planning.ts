import type { LogisticsTaskSection } from "@/lib/db/schema";

export type PlanningBlockDraft = {
  slot: string;
  label: string;
  /** Temps libre / respiration — ~35 % du programme. */
  isFree: boolean;
};

/** Génère des créneaux avec environ un tiers de temps libre (alternance douce). */
export function blocksForDay(dayIndex: number): PlanningBlockDraft[] {
  const base: PlanningBlockDraft[] = [
    { slot: "08h00", label: "Petit-déjeuner lumineux & silence habité", isFree: false },
    { slot: "09h30", label: "Cercle intention — respiration & oracle du jour", isFree: false },
    { slot: "11h00", label: "Temps libre — corps, marche lente ou journal", isFree: true },
    { slot: "12h30", label: "Déjeuner partagé", isFree: false },
    { slot: "14h30", label: "Atelier Reiki doux / toucher conscient", isFree: false },
    { slot: "16h00", label: "Temps libre — sieste, lecture, eau", isFree: true },
    { slot: "17h30", label: "Cercle oracle / voix juste", isFree: false },
    { slot: "19h30", label: "Dîner & gratitude", isFree: false },
    { slot: "21h00", label: "Temps libre — veillée douce ou repos", isFree: true },
  ];

  if (dayIndex === 0) {
    return [
      { slot: "15h00", label: "Accueil des montures — installation & tisane", isFree: false },
      { slot: "16h30", label: "Temps libre — lieux & souffle", isFree: true },
      { slot: "18h00", label: "Cercle d’ouverture & intentions", isFree: false },
      { slot: "19h30", label: "Dîner bienveillant", isFree: false },
      { slot: "21h00", label: "Temps libre — calme nocturne", isFree: true },
      ...base.slice(1),
    ];
  }

  return base;
}

export function countDaysInclusive(startIso: string, endIso: string): number {
  const a = new Date(startIso + "T12:00:00");
  const b = new Date(endIso + "T12:00:00");
  const diff = (b.getTime() - a.getTime()) / 86400000;
  return Math.max(1, Math.floor(diff) + 1);
}

export type TaskSeed = {
  section: LogisticsTaskSection;
  dayIndex: number | null;
  slot?: string;
  label: string;
  sortOrder: number;
};

export function buildPlanningSeeds(startDate: string, endDate: string): TaskSeed[] {
  const n = countDaysInclusive(startDate, endDate);
  const out: TaskSeed[] = [];
  let order = 0;
  for (let d = 0; d < n; d++) {
    const blocks = blocksForDay(d);
    blocks.forEach((b) => {
      out.push({
        section: "planning",
        dayIndex: d,
        slot: b.slot,
        label: b.isFree ? `✦ ${b.label}` : b.label,
        sortOrder: order++,
      });
    });
  }
  return out;
}

export function defaultChecklistSeeds(): TaskSeed[] {
  const material: TaskSeed[] = [
    { section: "material", dayIndex: null, label: "Tables Reiki & huiles végétales", sortOrder: 0 },
    { section: "material", dayIndex: null, label: "Couvertures, bolster, tapis silence", sortOrder: 1 },
    { section: "material", dayIndex: null, label: "Oracle / tarot / carnets invités", sortOrder: 2 },
    { section: "material", dayIndex: null, label: "Enceinte douce & playlist sans parole", sortOrder: 3 },
    { section: "material", dayIndex: null, label: "Kit premiers secours & sensibilités", sortOrder: 4 },
  ];
  const transport: TaskSeed[] = [
    { section: "transport", dayIndex: null, label: "Calendrier transferts aéroport / gare", sortOrder: 0 },
    { section: "transport", dayIndex: null, label: "Numéros taxis locaux & backup", sortOrder: 1 },
    { section: "transport", dayIndex: null, label: "Accès lieu & codes / boîtes à clés", sortOrder: 2 },
  ];
  return [...material, ...transport];
}
