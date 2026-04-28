"use client";

import { motion } from "framer-motion";
import type { TreasureKpis } from "@/lib/treasure/kpi-engine";
import { cn } from "@/lib/utils";

const eur = (n: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(
    n
  );

export function TreasureRankingsWidget({
  kpis,
  hyperfocus,
}: {
  kpis: TreasureKpis;
  hyperfocus?: boolean;
}) {
  const topDest = kpis.byDestination.slice(0, 3);
  const topPkg = kpis.byPackageDays.slice(0, 3);
  const topEnergy = kpis.byEnergy.slice(0, 3);

  const empty = (
    <p className="text-sm italic text-padma-night/55">
      Les constellations se dessinent avec vos premières réservations payées.
    </p>
  );

  return (
    <div className={cn("grid gap-4 lg:grid-cols-3", hyperfocus && "gap-3")}>
      <motion.section
        initial={{ opacity: 0.85 }}
        animate={{ opacity: 1 }}
        className="rounded-xl border border-padma-champagne/15 bg-white/50 px-3 py-3"
      >
        <p className="font-cinzel text-xs tracking-wide text-padma-night">Destinations</p>
        <ul className="mt-2 space-y-2">
          {topDest.length === 0
            ? empty
            : topDest.map((d, i) => (
                <li
                  key={d.id}
                  className="flex items-center justify-between gap-2 text-sm text-padma-night/88"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-padma-champagne/25 text-[0.65rem] font-medium text-padma-night">
                      {i + 1}
                    </span>
                    <span className="truncate">{d.label}</span>
                  </span>
                  <span className="shrink-0 font-display text-padma-pearl">{eur(d.revenueEuro)}</span>
                </li>
              ))}
        </ul>
      </motion.section>

      <motion.section
        initial={{ opacity: 0.85 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.05 }}
        className="rounded-xl border border-padma-champagne/15 bg-white/50 px-3 py-3"
      >
        <p className="font-cinzel text-xs tracking-wide text-padma-night">Durées</p>
        <ul className="mt-2 space-y-2">
          {topPkg.length === 0
            ? empty
            : topPkg.map((p, i) => (
                <li
                  key={p.days}
                  className="flex items-center justify-between gap-2 text-sm text-padma-night/88"
                >
                  <span className="flex items-center gap-2">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-padma-lavender/22 text-[0.65rem] font-medium text-padma-night">
                      {i + 1}
                    </span>
                    {p.days} jours
                  </span>
                  <span className="shrink-0 text-xs text-padma-night/55">{p.count} ×</span>
                </li>
              ))}
        </ul>
      </motion.section>

      <motion.section
        initial={{ opacity: 0.85 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="rounded-xl border border-padma-champagne/15 bg-white/50 px-3 py-3"
      >
        <p className="font-cinzel text-xs tracking-wide text-padma-night">Énergies</p>
        <ul className="mt-2 space-y-2">
          {topEnergy.length === 0
            ? empty
            : topEnergy.map((e, i) => (
                <li
                  key={e.id}
                  className="flex items-center justify-between gap-2 text-sm text-padma-night/88"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-padma-pearl/28 text-[0.65rem] font-medium text-padma-night">
                      {i + 1}
                    </span>
                    <span className="truncate">{e.label}</span>
                  </span>
                  <span className="shrink-0 font-display text-xs text-padma-pearl">{eur(e.revenueEuro)}</span>
                </li>
              ))}
        </ul>
      </motion.section>
    </div>
  );
}
