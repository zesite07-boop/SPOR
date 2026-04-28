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
    <p className="text-sm italic text-padma-night/55 dark:text-padma-cream/58">
      Les constellations se dessinent avec vos premières réservations payées.
    </p>
  );

  return (
    <div className={cn("grid gap-4 lg:grid-cols-3", hyperfocus && "gap-3")}>
      <motion.section
        initial={{ opacity: 0.85 }}
        animate={{ opacity: 1 }}
        className="rounded-xl border border-padma-champagne/15 bg-white/50 px-3 py-3 dark:border-padma-lavender/12 dark:bg-padma-night/35"
      >
        <p className="font-cinzel text-xs tracking-wide text-padma-night dark:text-padma-cream">Destinations</p>
        <ul className="mt-2 space-y-2">
          {topDest.length === 0
            ? empty
            : topDest.map((d, i) => (
                <li
                  key={d.id}
                  className="flex items-center justify-between gap-2 text-sm text-padma-night/88 dark:text-padma-cream/88"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-padma-champagne/25 text-[0.65rem] font-medium text-padma-night dark:bg-padma-lavender/25 dark:text-padma-cream">
                      {i + 1}
                    </span>
                    <span className="truncate">{d.label}</span>
                  </span>
                  <span className="shrink-0 font-display text-padma-pearl dark:text-padma-lavender/90">{eur(d.revenueEuro)}</span>
                </li>
              ))}
        </ul>
      </motion.section>

      <motion.section
        initial={{ opacity: 0.85 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.05 }}
        className="rounded-xl border border-padma-champagne/15 bg-white/50 px-3 py-3 dark:border-padma-lavender/12 dark:bg-padma-night/35"
      >
        <p className="font-cinzel text-xs tracking-wide text-padma-night dark:text-padma-cream">Durées</p>
        <ul className="mt-2 space-y-2">
          {topPkg.length === 0
            ? empty
            : topPkg.map((p, i) => (
                <li
                  key={p.days}
                  className="flex items-center justify-between gap-2 text-sm text-padma-night/88 dark:text-padma-cream/88"
                >
                  <span className="flex items-center gap-2">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-padma-lavender/22 text-[0.65rem] font-medium text-padma-night dark:bg-padma-lavender/28 dark:text-padma-cream">
                      {i + 1}
                    </span>
                    {p.days} jours
                  </span>
                  <span className="shrink-0 text-xs text-padma-night/55 dark:text-padma-cream/58">{p.count} ×</span>
                </li>
              ))}
        </ul>
      </motion.section>

      <motion.section
        initial={{ opacity: 0.85 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="rounded-xl border border-padma-champagne/15 bg-white/50 px-3 py-3 dark:border-padma-lavender/12 dark:bg-padma-night/35"
      >
        <p className="font-cinzel text-xs tracking-wide text-padma-night dark:text-padma-cream">Énergies</p>
        <ul className="mt-2 space-y-2">
          {topEnergy.length === 0
            ? empty
            : topEnergy.map((e, i) => (
                <li
                  key={e.id}
                  className="flex items-center justify-between gap-2 text-sm text-padma-night/88 dark:text-padma-cream/88"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-padma-pearl/28 text-[0.65rem] font-medium text-padma-night dark:bg-padma-pearl/18 dark:text-padma-cream">
                      {i + 1}
                    </span>
                    <span className="truncate">{e.label}</span>
                  </span>
                  <span className="shrink-0 font-display text-xs text-padma-pearl dark:text-padma-lavender/90">{eur(e.revenueEuro)}</span>
                </li>
              ))}
        </ul>
      </motion.section>
    </div>
  );
}
