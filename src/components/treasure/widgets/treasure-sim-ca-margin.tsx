"use client";

import { useMemo, useState } from "react";
import { countDaysInclusive } from "@/lib/logistics/default-planning";
import type { ReservationRecord, TreasureSimulatorSettings } from "@/lib/db/schema";
import { getRetreatById, RETREAT_CATALOG } from "@/lib/reservation/catalog";
import { simulateMargin } from "@/lib/treasure/simulators";
import { cn } from "@/lib/utils";

const eur = (n: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(
    n
  );

export function TreasureSimCaMargin({
  reservations,
  settings,
  onPatchSettings,
  hyperfocus,
}: {
  reservations: ReservationRecord[];
  settings: TreasureSimulatorSettings;
  onPatchSettings: (p: Partial<Omit<TreasureSimulatorSettings, "id" | "updatedAt">>) => void;
  hyperfocus?: boolean;
}) {
  const retreatIds = useMemo(() => RETREAT_CATALOG.map((r) => r.id), []);
  const [retreatId, setRetreatId] = useState(retreatIds[0] ?? "");

  const stats = useMemo(() => {
    const paid = reservations.filter((x) => x.retreatId === retreatId && x.status === "paid");
    const revenueEuro = paid.reduce((s, x) => s + x.totalCents / 100, 0);
    const heads = paid.reduce((s, x) => s + x.participants, 0);
    return { revenueEuro, heads, bookings: paid.length };
  }, [reservations, retreatId]);

  const retreat = getRetreatById(retreatId);
  const days = retreat ? countDaysInclusive(retreat.startDate, retreat.endDate) : 7;

  const margin = simulateMargin({
    revenueEuro: stats.revenueEuro,
    participantCount: Math.max(1, stats.heads || 1),
    retreatDays: days,
    variableCostPerParticipantDayEuro: settings.variableCostPerParticipantDayEuro,
    retreatFixedOverheadEuro: settings.retreatFixedOverheadEuro,
  });

  return (
    <div className={cn("space-y-4", hyperfocus && "space-y-3")}>
      <div>
        <label htmlFor="treasure-retreat" className="font-display text-[0.65rem] uppercase tracking-[0.18em] text-padma-pearl dark:text-padma-lavender/85">
          Retraite
        </label>
        <select
          id="treasure-retreat"
          value={retreatId}
          onChange={(e) => setRetreatId(e.target.value)}
          className="mt-1.5 w-full rounded-xl border border-padma-champagne/25 bg-white/90 px-3 py-2.5 text-sm text-padma-night outline-none ring-padma-lavender/30 focus:ring-2 dark:border-padma-lavender/25 dark:bg-padma-night/60 dark:text-padma-cream"
        >
          {RETREAT_CATALOG.map((r) => (
            <option key={r.id} value={r.id}>
              {r.title}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="font-display text-[0.65rem] uppercase tracking-[0.18em] text-padma-pearl dark:text-padma-lavender/85">
            Coût variable / pers. / jour
          </label>
          <input
            type="number"
            min={0}
            step={1}
            value={settings.variableCostPerParticipantDayEuro}
            onChange={(e) =>
              onPatchSettings({ variableCostPerParticipantDayEuro: Number(e.target.value) || 0 })
            }
            className="mt-1.5 w-full rounded-xl border border-padma-champagne/25 bg-white/90 px-3 py-2 text-sm dark:border-padma-lavender/25 dark:bg-padma-night/60 dark:text-padma-cream"
          />
        </div>
        <div>
          <label className="font-display text-[0.65rem] uppercase tracking-[0.18em] text-padma-pearl dark:text-padma-lavender/85">
            Frais fixes retraite
          </label>
          <input
            type="number"
            min={0}
            step={50}
            value={settings.retreatFixedOverheadEuro}
            onChange={(e) => onPatchSettings({ retreatFixedOverheadEuro: Number(e.target.value) || 0 })}
            className="mt-1.5 w-full rounded-xl border border-padma-champagne/25 bg-white/90 px-3 py-2 text-sm dark:border-padma-lavender/25 dark:bg-padma-night/60 dark:text-padma-cream"
          />
        </div>
      </div>

      <div className="rounded-xl border border-padma-lavender/18 bg-gradient-to-br from-padma-cream/50 to-transparent px-4 py-3 dark:from-padma-lavender/8 dark:to-transparent">
        <p className="text-xs text-padma-night/72 dark:text-padma-cream/75">
          CA payé (Dexie) · <span className="font-medium text-padma-night dark:text-padma-cream">{eur(stats.revenueEuro)}</span> —{" "}
          {stats.heads} participante(s), {stats.bookings} dossier(s) — {days} jour(s) calendaires.
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          <div>
            <p className="text-[0.65rem] uppercase tracking-wide text-padma-pearl dark:text-padma-lavender/80">Coûts variables</p>
            <p className="font-cinzel text-lg text-padma-night dark:text-padma-cream">{eur(margin.variableTotal)}</p>
          </div>
          <div>
            <p className="text-[0.65rem] uppercase tracking-wide text-padma-pearl dark:text-padma-lavender/80">Marge estimée</p>
            <p className="font-cinzel text-lg text-padma-night dark:text-padma-cream">{eur(margin.marginEuro)}</p>
          </div>
          <div>
            <p className="text-[0.65rem] uppercase tracking-wide text-padma-pearl dark:text-padma-lavender/80">Taux</p>
            <p className="font-cinzel text-lg text-padma-night dark:text-padma-cream">{margin.marginPercent.toFixed(1)} %</p>
          </div>
        </div>
      </div>
    </div>
  );
}
