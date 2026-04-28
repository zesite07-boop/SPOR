import type {
  TreasureGamificationState,
  TreasureSimulatorSettings,
  TreasureWidgetLayout,
} from "@/lib/db/schema";
import { db } from "@/lib/db/schema";
import {
  DEFAULT_WIDGET_ORDER,
  normalizeWidgetOrder,
  TREASURE_ROW_ID,
} from "@/lib/treasure/widget-ids";
import type { TreasureKpis } from "@/lib/treasure/kpi-engine";

const DEFAULT_SIMULATOR: Omit<TreasureSimulatorSettings, "updatedAt"> = {
  id: TREASURE_ROW_ID,
  monthlyFixedCostsEuro: 2400,
  variableCostPerParticipantDayEuro: 38,
  retreatFixedOverheadEuro: 1800,
  microContributionRate: 0.22,
};

export function defaultWidgetLayout(): TreasureWidgetLayout {
  return {
    id: TREASURE_ROW_ID,
    widgetOrder: [...DEFAULT_WIDGET_ORDER],
    updatedAt: Date.now(),
  };
}

export function defaultSimulatorSettings(): TreasureSimulatorSettings {
  return { ...DEFAULT_SIMULATOR, updatedAt: Date.now() };
}

export async function loadWidgetLayout(): Promise<TreasureWidgetLayout> {
  const dexie = db;
  if (!dexie) return defaultWidgetLayout();
  let row = await dexie.treasureWidgetLayout.get(TREASURE_ROW_ID);
  if (!row) {
    row = defaultWidgetLayout();
    await dexie.treasureWidgetLayout.put(row);
  } else {
    row = {
      ...row,
      widgetOrder: normalizeWidgetOrder(row.widgetOrder),
    };
  }
  return row;
}

export async function saveWidgetOrder(order: string[]): Promise<void> {
  const dexie = db;
  if (!dexie) return;
  const normalized = normalizeWidgetOrder(order);
  await dexie.treasureWidgetLayout.put({
    id: TREASURE_ROW_ID,
    widgetOrder: normalized,
    updatedAt: Date.now(),
  });
}

export async function loadSimulatorSettings(): Promise<TreasureSimulatorSettings> {
  const dexie = db;
  if (!dexie) return defaultSimulatorSettings();
  let row = await dexie.treasureSimulatorSettings.get(TREASURE_ROW_ID);
  if (!row) {
    row = defaultSimulatorSettings();
    await dexie.treasureSimulatorSettings.put(row);
  }
  return row;
}

export async function saveSimulatorSettings(
  patch: Partial<Omit<TreasureSimulatorSettings, "id" | "updatedAt">>
): Promise<void> {
  const dexie = db;
  if (!dexie) return;
  const prev = await loadSimulatorSettings();
  await dexie.treasureSimulatorSettings.put({
    ...prev,
    ...patch,
    id: TREASURE_ROW_ID,
    updatedAt: Date.now(),
  });
}

const BADGE_DEFS: { id: string; label: string; test: (k: TreasureKpis) => boolean }[] = [
  {
    id: "first-flow",
    label: "Premier flux",
    test: (k) => k.reservationCountPaid >= 1,
  },
  {
    id: "moon-half",
    label: "Demi-lune · 50 % de remplissage",
    test: (k) => k.fillRatePercent >= 50,
  },
  {
    id: "portugal-pulse",
    label: "Lisbonne du cœur — CA Portugal",
    test: (k) =>
      k.byDestination.some((d) => d.id === "portugal" && d.revenueEuro > 0),
  },
  {
    id: "seven-flow",
    label: "Cycle 7 — package signature",
    test: (k) =>
      k.byPackageDays.some((p) => p.days === 7 && p.count >= 1),
  },
];

export function computeBadgeIds(kpis: TreasureKpis): string[] {
  return BADGE_DEFS.filter((b) => b.test(kpis)).map((b) => b.id);
}

export function badgeLabel(id: string): string {
  return BADGE_DEFS.find((b) => b.id === id)?.label ?? id;
}

/** Points affichés : agrégation douce à partir du CA et des participantes (pas une monnaie réelle). */
export function computeEnergyScore(kpis: TreasureKpis): number {
  const raw =
    kpis.caRealEuro * 6 +
    kpis.participantCount * 14 +
    kpis.fillRatePercent * 12;
  return Math.min(99999, Math.round(raw));
}

export async function syncGamification(kpis: TreasureKpis): Promise<TreasureGamificationState> {
  const dexie = db;
  const energyPoints = computeEnergyScore(kpis);
  const badges = computeBadgeIds(kpis);
  const row: TreasureGamificationState = {
    id: TREASURE_ROW_ID,
    energyPoints,
    badges,
    updatedAt: Date.now(),
  };
  if (dexie) {
    await dexie.treasureGamification.put(row);
  }
  return row;
}

export async function loadGamification(): Promise<TreasureGamificationState | null> {
  const dexie = db;
  if (!dexie) return null;
  const row = await dexie.treasureGamification.get(TREASURE_ROW_ID);
  return row ?? null;
}
