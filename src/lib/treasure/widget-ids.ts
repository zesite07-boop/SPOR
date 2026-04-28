/** Identifiants des blocs repositionnables du tableau de bord Trésor. */
export const TREASURE_WIDGET_IDS = [
  "kpis",
  "rankings",
  "sim-ca",
  "sim-breakeven",
  "sim-scenario",
  "sim-fiscal",
  "gamification",
] as const;

export type TreasureWidgetId = (typeof TREASURE_WIDGET_IDS)[number];

export const DEFAULT_WIDGET_ORDER: TreasureWidgetId[] = [...TREASURE_WIDGET_IDS];

export const TREASURE_ROW_ID = "global" as const;

export function normalizeWidgetOrder(order: string[]): TreasureWidgetId[] {
  const known = new Set<string>(TREASURE_WIDGET_IDS);
  const seen = new Set<string>();
  const out: TreasureWidgetId[] = [];
  for (const id of order) {
    if (known.has(id) && !seen.has(id)) {
      seen.add(id);
      out.push(id as TreasureWidgetId);
    }
  }
  for (const id of TREASURE_WIDGET_IDS) {
    if (!seen.has(id)) out.push(id);
  }
  return out;
}
