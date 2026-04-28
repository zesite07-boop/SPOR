"use client";

import { useMemo, useState } from "react";
import type { TreasureSimulatorSettings } from "@/lib/db/schema";
import { simulateMicroFiscalSnapshot } from "@/lib/treasure/simulators";
import { cn } from "@/lib/utils";

const eur = (n: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(
    n
  );

export function TreasureSimFiscalMicro({
  caAnnualHintEuro,
  settings,
  onPatchSettings,
  hyperfocus,
}: {
  caAnnualHintEuro: number;
  settings: TreasureSimulatorSettings;
  onPatchSettings: (p: Partial<Omit<TreasureSimulatorSettings, "id" | "updatedAt">>) => void;
  hyperfocus?: boolean;
}) {
  const [caTtc, setCaTtc] = useState(Math.max(0, caAnnualHintEuro));
  const [allowance, setAllowance] = useState(0.34);

  const snap = useMemo(
    () =>
      simulateMicroFiscalSnapshot({
        grossRevenueTtcEuro: caTtc,
        allowanceRate: allowance,
        socialRateOnCa: settings.microContributionRate,
      }),
    [caTtc, allowance, settings.microContributionRate]
  );

  return (
    <div className={cn("space-y-4", hyperfocus && "space-y-3")}>
      <p className="text-xs leading-relaxed text-padma-night/68">
        Indication pédagogique uniquement : abattement et cotisations sont simplifiés. L’impôt sur le revenu, la TVA et votre activité réelle
        demandent un conseil expert.
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="font-display text-[0.65rem] uppercase tracking-[0.18em] text-padma-pearl">
            CA TTC annuel (€)
          </label>
          <input
            type="number"
            min={0}
            step={500}
            value={Math.round(caTtc)}
            onChange={(e) => setCaTtc(Number(e.target.value) || 0)}
            className="mt-1.5 w-full rounded-xl border border-padma-champagne/25 bg-white/90 px-3 py-2 text-sm"
          />
          <button
            type="button"
            className="mt-2 text-[0.7rem] text-padma-pearl underline decoration-padma-champagne/50 underline-offset-2 hover:text-padma-night"
            onClick={() => setCaTtc(Math.max(0, caAnnualHintEuro))}
          >
            Reprendre le CA réalisé local ({eur(caAnnualHintEuro)})
          </button>
        </div>
        <div>
          <label className="font-display text-[0.65rem] uppercase tracking-[0.18em] text-padma-pearl">
            Abattement forfaitaire (0–1)
          </label>
          <input
            type="number"
            min={0}
            max={1}
            step={0.01}
            value={allowance}
            onChange={(e) => setAllowance(Math.min(1, Math.max(0, Number(e.target.value) || 0)))}
            className="mt-1.5 w-full rounded-xl border border-padma-champagne/25 bg-white/90 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div>
        <label className="font-display text-[0.65rem] uppercase tracking-[0.18em] text-padma-pearl">
          Taux cotisations sur CA (micro)
        </label>
        <input
          type="number"
          min={0}
          max={0.5}
          step={0.01}
          value={settings.microContributionRate}
          onChange={(e) => onPatchSettings({ microContributionRate: Number(e.target.value) || 0 })}
          className="mt-1.5 w-full rounded-xl border border-padma-champagne/25 bg-white/90 px-3 py-2 text-sm"
        />
      </div>

      <div className="grid gap-3 rounded-xl border border-padma-lavender/15 bg-white/55 px-4 py-3 sm:grid-cols-3">
        <div>
          <p className="text-[0.65rem] uppercase tracking-wide text-padma-pearl">Base imposable approx.</p>
          <p className="font-cinzel text-lg text-padma-night">{eur(snap.baseImposableApproxEuro)}</p>
        </div>
        <div>
          <p className="text-[0.65rem] uppercase tracking-wide text-padma-pearl">Charges sociales approx.</p>
          <p className="font-cinzel text-lg text-padma-night">{eur(snap.socialChargesApproxEuro)}</p>
        </div>
        <div>
          <p className="text-[0.65rem] uppercase tracking-wide text-padma-pearl">Après charges (approx.)</p>
          <p className="font-cinzel text-lg text-padma-night">{eur(snap.netAfterSocialApproxEuro)}</p>
        </div>
      </div>
    </div>
  );
}
