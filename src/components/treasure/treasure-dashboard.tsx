"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { HyperfocusToolbar } from "@/components/layout/hyperfocus-toolbar";
import type { ReservationRecord, TreasureGamificationState, TreasureSimulatorSettings } from "@/lib/db/schema";
import { db } from "@/lib/db/schema";
import { computeTreasureKpis } from "@/lib/treasure/kpi-engine";
import {
  loadSimulatorSettings,
  loadWidgetLayout,
  saveSimulatorSettings,
  saveWidgetOrder,
  syncGamification,
} from "@/lib/treasure/treasure-actions";
import type { TreasureWidgetId } from "@/lib/treasure/widget-ids";
import { normalizeWidgetOrder } from "@/lib/treasure/widget-ids";
import { useUiStore } from "@/stores/ui-store";
import { cn } from "@/lib/utils";
import { TreasureMandalaHero } from "@/components/treasure/treasure-mandala-hero";
import { TreasureSortableStack } from "@/components/treasure/treasure-sortable-stack";
import { TreasureGamificationWidget } from "@/components/treasure/widgets/treasure-gamification";
import { TreasureKpiOverview } from "@/components/treasure/widgets/treasure-kpi-overview";
import { TreasureRankingsWidget } from "@/components/treasure/widgets/treasure-rankings-widget";
import { TreasureSimBreakeven } from "@/components/treasure/widgets/treasure-sim-breakeven";
import { TreasureSimCaMargin } from "@/components/treasure/widgets/treasure-sim-ca-margin";
import { TreasureSimFiscalMicro } from "@/components/treasure/widgets/treasure-sim-fiscal-micro";
import { TreasureSimScenario } from "@/components/treasure/widgets/treasure-sim-scenario";

export function TreasureDashboard() {
  const hyperfocus = useUiStore((s) => s.hyperfocus);
  const celebrate = useUiStore((s) => s.celebrate);
  const [order, setOrder] = useState<TreasureWidgetId[]>(() => normalizeWidgetOrder([]));
  const [reservations, setReservations] = useState<ReservationRecord[]>([]);
  const [settings, setSettings] = useState<TreasureSimulatorSettings | null>(null);
  const [gamification, setGamification] = useState<TreasureGamificationState | null>(null);
  const saveSimTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const refresh = useCallback(async () => {
    if (!db) {
      setReservations([]);
      return;
    }
    const rows = await db.reservations.toArray();
    setReservations(rows);
    const g = await syncGamification(computeTreasureKpis(rows));
    setGamification(g);
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const [layout, sim] = await Promise.all([loadWidgetLayout(), loadSimulatorSettings()]);
      if (cancelled) return;
      setOrder(normalizeWidgetOrder(layout.widgetOrder));
      setSettings(sim);
      await refresh();
    })();
    return () => {
      cancelled = true;
      if (saveSimTimer.current) clearTimeout(saveSimTimer.current);
    };
  }, [refresh]);

  const kpis = useMemo(() => computeTreasureKpis(reservations), [reservations]);

  const patchSettings = useCallback(
    (patch: Partial<Omit<TreasureSimulatorSettings, "id" | "updatedAt">>) => {
      setSettings((prev) => {
        if (!prev) return prev;
        const next: TreasureSimulatorSettings = { ...prev, ...patch, updatedAt: Date.now() };
        if (saveSimTimer.current) clearTimeout(saveSimTimer.current);
        saveSimTimer.current = setTimeout(() => {
          void saveSimulatorSettings(patch);
        }, 450);
        return next;
      });
    },
    []
  );

  const handleReorder = useCallback(
    (next: TreasureWidgetId[]) => {
      setOrder(next);
      void saveWidgetOrder(next).then(() => celebrate("Carte du Trésor réordonnée ✦"));
    },
    [celebrate]
  );

  const renderWidget = useCallback(
    (id: TreasureWidgetId) => {
      if (!settings) {
        return <p className="text-sm text-padma-night/60 dark:text-padma-cream/58">Préparation des grimoires…</p>;
      }
      switch (id) {
        case "kpis":
          return <TreasureKpiOverview kpis={kpis} hyperfocus={hyperfocus} />;
        case "rankings":
          return <TreasureRankingsWidget kpis={kpis} hyperfocus={hyperfocus} />;
        case "sim-ca":
          return (
            <TreasureSimCaMargin
              reservations={reservations}
              settings={settings}
              onPatchSettings={patchSettings}
              hyperfocus={hyperfocus}
            />
          );
        case "sim-breakeven":
          return (
            <TreasureSimBreakeven settings={settings} onPatchSettings={patchSettings} hyperfocus={hyperfocus} />
          );
        case "sim-scenario":
          return <TreasureSimScenario hyperfocus={hyperfocus} />;
        case "sim-fiscal":
          return (
            <TreasureSimFiscalMicro
              caAnnualHintEuro={kpis.caRealEuro}
              settings={settings}
              onPatchSettings={patchSettings}
              hyperfocus={hyperfocus}
            />
          );
        case "gamification":
          return <TreasureGamificationWidget state={gamification} hyperfocus={hyperfocus} />;
        default:
          return null;
      }
    },
    [settings, kpis, reservations, patchSettings, hyperfocus, gamification]
  );

  if (!settings) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 pb-24">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-padma-champagne/40 border-t-padma-lavender" aria-hidden />
        <p className="font-display text-sm text-padma-night/65 dark:text-padma-cream/65">Ouverture du coffret…</p>
      </div>
    );
  }

  return (
    <div className={cn("pb-24", hyperfocus && "space-y-6")}>
      <TreasureMandalaHero hyperfocus={hyperfocus} />

      <header className={cn("mb-8 space-y-4", hyperfocus && "mb-5 space-y-3")}>
        <HyperfocusToolbar />
        <p className="max-w-prose text-xs text-padma-night/62 dark:text-padma-cream/65">
          Glissez les :: à gauche de chaque carte pour réordonner votre tableau. Les préférences sont enregistrées sur cet appareil (Dexie).
        </p>
      </header>

      <TreasureSortableStack order={order} onReorder={handleReorder} hyperfocus={hyperfocus} childrenFor={renderWidget} />
    </div>
  );
}
