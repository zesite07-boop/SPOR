"use client";

import { motion } from "framer-motion";
import type { TreasureKpis } from "@/lib/treasure/kpi-engine";
import { cn } from "@/lib/utils";

const eur = (n: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(
    n
  );

export function TreasureKpiOverview({
  kpis,
  hyperfocus,
}: {
  kpis: TreasureKpis;
  hyperfocus?: boolean;
}) {
  const blocks = [
    {
      label: "CA réalisé (payé)",
      value: eur(kpis.caRealEuro),
      sub: `${kpis.reservationCountPaid} réservation(s)`,
    },
    {
      label: "Pipeline (encours)",
      value: eur(kpis.caPipelineEuro),
      sub: "Acomptes & parcours checkout",
    },
    {
      label: "Participantes (payé)",
      value: String(kpis.participantCount),
      sub: "Têtes comptées sur réservations soldées",
    },
    {
      label: "Remplissage à venir",
      value: `${kpis.fillRatePercent.toFixed(1)} %`,
      sub: `${kpis.headsUpcomingPaid} / ${kpis.upcomingCapacity} places catalogue`,
    },
  ];

  return (
    <div className={cn("grid gap-3 sm:grid-cols-2", hyperfocus && "gap-2")}>
      {blocks.map((b, i) => (
        <motion.div
          key={b.label}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: i * 0.04 }}
          className="rounded-xl border border-padma-champagne/18 bg-gradient-to-br from-white/90 to-padma-cream/40 px-4 py-3 dark:border-padma-lavender/14 dark:from-padma-night/60 dark:to-padma-night/35"
        >
          <p className="font-display text-[0.65rem] uppercase tracking-[0.18em] text-padma-pearl dark:text-padma-lavender/85">
            {b.label}
          </p>
          <p className="mt-1 font-cinzel text-xl font-normal text-padma-night dark:text-padma-cream">{b.value}</p>
          <p className="mt-1 text-[0.7rem] leading-snug text-padma-night/58 dark:text-padma-cream/62">{b.sub}</p>
        </motion.div>
      ))}
    </div>
  );
}
