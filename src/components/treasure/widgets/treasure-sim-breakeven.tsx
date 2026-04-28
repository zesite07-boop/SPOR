"use client";

import { useMemo, useState } from "react";
import type { TreasureSimulatorSettings } from "@/lib/db/schema";
import { simulateBreakEvenParticipants } from "@/lib/treasure/simulators";
import { cn } from "@/lib/utils";

export function TreasureSimBreakeven({
  settings,
  onPatchSettings,
  hyperfocus,
}: {
  settings: TreasureSimulatorSettings;
  onPatchSettings: (p: Partial<Omit<TreasureSimulatorSettings, "id" | "updatedAt">>) => void;
  hyperfocus?: boolean;
}) {
  const [avgPrice, setAvgPrice] = useState(1680);
  const [retreatDays, setRetreatDays] = useState(5);
  const [fixedShare, setFixedShare] = useState(0.35);

  const be = useMemo(
    () =>
      simulateBreakEvenParticipants({
        avgPricePerHeadEuro: avgPrice,
        variableCostPerParticipantDayEuro: settings.variableCostPerParticipantDayEuro,
        retreatDays,
        monthlyFixedCostsEuro: settings.monthlyFixedCostsEuro,
        monthlyFixedShare: fixedShare,
        retreatFixedOverheadEuro: settings.retreatFixedOverheadEuro,
      }),
    [avgPrice, retreatDays, fixedShare, settings]
  );

  const need =
    be.participantsNeeded === Infinity ? "∞" : String(be.participantsNeeded);

  return (
    <div className={cn("space-y-4", hyperfocus && "space-y-3")}>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="font-display text-[0.65rem] uppercase tracking-[0.18em] text-padma-pearl dark:text-padma-lavender/85">
            Charges fixes mensuelles
          </label>
          <input
            type="number"
            min={0}
            step={100}
            value={settings.monthlyFixedCostsEuro}
            onChange={(e) => onPatchSettings({ monthlyFixedCostsEuro: Number(e.target.value) || 0 })}
            className="mt-1.5 w-full rounded-xl border border-padma-champagne/25 bg-white/90 px-3 py-2 text-sm dark:border-padma-lavender/25 dark:bg-padma-night/60 dark:text-padma-cream"
          />
        </div>
        <div>
          <label className="font-display text-[0.65rem] uppercase tracking-[0.18em] text-padma-pearl dark:text-padma-lavender/85">
            Part du mois sur ce scénario (0–1)
          </label>
          <input
            type="number"
            min={0}
            max={1}
            step={0.05}
            value={fixedShare}
            onChange={(e) => setFixedShare(Math.min(1, Math.max(0, Number(e.target.value) || 0)))}
            className="mt-1.5 w-full rounded-xl border border-padma-champagne/25 bg-white/90 px-3 py-2 text-sm dark:border-padma-lavender/25 dark:bg-padma-night/60 dark:text-padma-cream"
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="font-display text-[0.65rem] uppercase tracking-[0.18em] text-padma-pearl dark:text-padma-lavender/85">
            Prix moyen / tête (TTC)
          </label>
          <input
            type="number"
            min={0}
            step={50}
            value={avgPrice}
            onChange={(e) => setAvgPrice(Number(e.target.value) || 0)}
            className="mt-1.5 w-full rounded-xl border border-padma-champagne/25 bg-white/90 px-3 py-2 text-sm dark:border-padma-lavender/25 dark:bg-padma-night/60 dark:text-padma-cream"
          />
        </div>
        <div>
          <label className="font-display text-[0.65rem] uppercase tracking-[0.18em] text-padma-pearl dark:text-padma-lavender/85">
            Durée retraite (jours)
          </label>
          <input
            type="number"
            min={1}
            max={21}
            value={retreatDays}
            onChange={(e) => setRetreatDays(Math.max(1, Number(e.target.value) || 1))}
            className="mt-1.5 w-full rounded-xl border border-padma-champagne/25 bg-white/90 px-3 py-2 text-sm dark:border-padma-lavender/25 dark:bg-padma-night/60 dark:text-padma-cream"
          />
        </div>
      </div>

      <div className="rounded-xl border border-padma-champagne/18 bg-white/60 px-4 py-3 dark:border-padma-lavender/14 dark:bg-padma-night/45">
        <p className="text-sm text-padma-night/78 dark:text-padma-cream/80">
          Contribution moyenne par participante (après coûts variables) :{" "}
          <span className="font-cinzel text-padma-night dark:text-padma-cream">
            {be.contributionPerHead.toFixed(0)} €
          </span>
        </p>
        <p className="mt-2 font-cinzel text-xl text-padma-night dark:text-padma-cream">
          Seuil : <span className="text-padma-pearl dark:text-padma-lavender">{need}</span> participante(s)
        </p>
        {be.contributionPerHead <= 0 ? (
          <p className="mt-2 text-xs text-red-700/90 dark:text-red-300/90">
            Le prix ne couvre pas les coûts variables au jour — montez le tarif ou baissez les coûts.
          </p>
        ) : null}
      </div>
    </div>
  );
}
