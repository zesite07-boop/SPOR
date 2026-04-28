"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, MapPin } from "lucide-react";
import type { RetreatDefinition } from "@/lib/reservation/catalog";
import type { LogisticsRetreatStatus } from "@/lib/db/schema";
import { LogisticsStatusBadge } from "@/components/logistics/logistics-status-badge";

function fmtShort(start: string, end: string) {
  const a = new Date(start + "T12:00:00");
  const b = new Date(end + "T12:00:00");
  return `${a.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })} → ${b.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })}`;
}

export function LogisticsRetreatCard({
  retreat,
  status,
  index = 0,
}: {
  retreat: RetreatDefinition;
  status: LogisticsRetreatStatus;
  index?: number;
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="rounded-[1.5rem] border border-padma-champagne/35 bg-gradient-to-br from-white/95 to-padma-lavender/10 p-5 shadow-soft dark:from-padma-night/65 dark:to-padma-lavender/10"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <LogisticsStatusBadge status={status} />
          <h2 className="mt-2 font-cinzel text-lg text-padma-night dark:text-padma-cream">{retreat.title}</h2>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-padma-night/60 dark:text-padma-cream/65">
            <MapPin className="h-3.5 w-3.5" aria-hidden />
            {retreat.destinationLabel}
          </p>
        </div>
        <p className="text-xs text-padma-night/55 dark:text-padma-cream/58">{fmtShort(retreat.startDate, retreat.endDate)}</p>
      </div>
      <Link
        href={`/logistique/${retreat.id}`}
        className="mt-4 inline-flex items-center gap-2 rounded-full border border-padma-lavender/40 bg-white/80 px-4 py-2 text-sm font-medium text-padma-night transition hover:bg-padma-champagne/15 dark:border-padma-lavender/30 dark:bg-padma-night/50 dark:text-padma-cream dark:hover:bg-padma-lavender/15"
      >
        Ouvrir l’espace opérationnel
        <ArrowRight className="h-4 w-4" aria-hidden />
      </Link>
    </motion.article>
  );
}
