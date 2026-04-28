"use client";

import { useMemo, useState } from "react";
import {
  type PackageDays,
  getRetreatById,
  RETREAT_CATALOG,
} from "@/lib/reservation/catalog";
import { simulateExtraRetreatScenario } from "@/lib/treasure/simulators";
import { cn } from "@/lib/utils";

const eur = (n: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(
    n
  );

export function TreasureSimScenario({ hyperfocus }: { hyperfocus?: boolean }) {
  const portugalDefault =
    RETREAT_CATALOG.find((r) => r.id === "padma-sintra-ether") ?? RETREAT_CATALOG[0]!;
  const [templateId, setTemplateId] = useState(portugalDefault.id);
  const [packageDays, setPackageDays] = useState<PackageDays>(7);
  const [spots, setSpots] = useState(12);
  const [fill, setFill] = useState(0.72);

  const template = getRetreatById(templateId)!;
  const pkg = template.packages.find((p) => p.days === packageDays) ?? template.packages[1] ?? template.packages[0]!;

  const scenario = useMemo(
    () =>
      simulateExtraRetreatScenario({
        template,
        assumedAvgPriceEuro: pkg.priceEuro,
        spotsTotal: spots,
        fillRatio: fill,
      }),
    [template, pkg.priceEuro, spots, fill]
  );

  return (
    <div className={cn("space-y-4", hyperfocus && "space-y-3")}>
      <p className="text-sm text-padma-night/75">
        « Si j’ajoute une retraite au Portugal en nouvelle lune… » — choisissez un ritme du catalogue comme squelette, puis ajustez places et
        remplissage.
      </p>

      <div>
        <label htmlFor="scenario-template" className="font-display text-[0.65rem] uppercase tracking-[0.18em] text-padma-pearl">
          Modèle
        </label>
        <select
          id="scenario-template"
          value={templateId}
          onChange={(e) => setTemplateId(e.target.value)}
          className="mt-1.5 w-full rounded-xl border border-padma-champagne/25 bg-white/90 px-3 py-2.5 text-sm text-padma-night outline-none focus:ring-2 focus:ring-padma-lavender/35"
        >
          {RETREAT_CATALOG.map((r) => (
            <option key={r.id} value={r.id}>
              {r.title} — {r.destinationLabel}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label className="font-display text-[0.65rem] uppercase tracking-[0.18em] text-padma-pearl">
            Formule
          </label>
          <select
            value={packageDays}
            onChange={(e) => setPackageDays(Number(e.target.value) as PackageDays)}
            className="mt-1.5 w-full rounded-xl border border-padma-champagne/25 bg-white/90 px-3 py-2 text-sm"
          >
            {template.packages.map((p) => (
              <option key={p.days} value={p.days}>
                {p.label} — {p.priceEuro} €
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="font-display text-[0.65rem] uppercase tracking-[0.18em] text-padma-pearl">
            Places proposées
          </label>
          <input
            type="number"
            min={4}
            max={40}
            value={spots}
            onChange={(e) => setSpots(Math.max(4, Number(e.target.value) || 4))}
            className="mt-1.5 w-full rounded-xl border border-padma-champagne/25 bg-white/90 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="font-display text-[0.65rem] uppercase tracking-[0.18em] text-padma-pearl">
            Remplissage visé (0–1)
          </label>
          <input
            type="number"
            min={0}
            max={1}
            step={0.05}
            value={fill}
            onChange={(e) => setFill(Math.min(1, Math.max(0, Number(e.target.value) || 0)))}
            className="mt-1.5 w-full rounded-xl border border-padma-champagne/25 bg-white/90 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="rounded-xl border border-padma-champagne/18 bg-gradient-to-r from-padma-champagne/12 to-padma-lavender/10 px-4 py-4">
        <p className="text-xs text-padma-night/70">
          Projection ponctuelle sur ce cycle : {scenario.retreatDays} jour(s),{" "}
          <span className="font-medium text-padma-night">{scenario.projectedHeads}</span> participante(s), panier{" "}
          {pkg.priceEuro} €.
        </p>
        <p className="mt-2 font-cinzel text-2xl tracking-wide text-padma-night">
          CA scénario : {eur(scenario.projectedRevenueEuro)}
        </p>
      </div>
    </div>
  );
}
