"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, MapPin, Sparkles, Users } from "lucide-react";
import type { RetreatDefinition } from "@/lib/reservation/catalog";
import { cn } from "@/lib/utils";

function fmtRange(start: string, end: string) {
  const a = new Date(start + "T12:00:00");
  const b = new Date(end + "T12:00:00");
  return `${a.toLocaleDateString("fr-FR", { day: "numeric", month: "long" })} — ${b.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })}`;
}

export function RetreatCard({ retreat, index = 0 }: { retreat: RetreatDefinition; index?: number }) {
  const minPrice = Math.min(...retreat.packages.map((p) => p.priceEuro));

  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.06 }}
      className="group relative overflow-hidden rounded-[1.75rem] border border-padma-champagne/35 bg-gradient-to-br from-white/95 via-padma-cream/90 to-padma-lavender/12 shadow-soft dark:border-[#c9a96e38] dark:from-[#1f1b31] dark:via-[#1a1828] dark:to-[#26213c]"
    >
      <div
        className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-padma-champagne/25 blur-3xl transition-opacity group-hover:opacity-90 dark:bg-padma-lavender/15"
        aria-hidden
      />
      <div className="relative p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-display text-[0.65rem] uppercase tracking-[0.28em] text-padma-pearl dark:text-[#d8d0c4]">
              {retreat.energyLabel}
            </p>
            <h2 className="mt-2 font-cinzel text-xl font-normal tracking-wide text-padma-night dark:text-padma-cream">
              {retreat.title}
            </h2>
            <p className="mt-1 text-sm text-padma-night/72 dark:text-[#e5ddcf]">{retreat.subtitle}</p>
          </div>
          <span className="rounded-full border border-padma-champagne/40 bg-padma-cream/60 px-3 py-1 text-xs font-medium text-padma-night dark:border-[#c9a96e45] dark:bg-[#2a2740] dark:text-[#f0e2c2]">
            dès {minPrice} €
          </span>
        </div>

        <p className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-padma-night/68 dark:text-[#e2dacd]">
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-padma-lavender" aria-hidden />
            {retreat.destinationLabel}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-padma-champagne" aria-hidden />
            {retreat.spotsLeft} / {retreat.spotsTotal} places
          </span>
        </p>

        <p className="mt-3 text-sm leading-relaxed text-padma-night/78 dark:text-[#e5ddcf]">
          <Sparkles className="mr-1 inline h-3.5 w-3.5 text-padma-champagne" aria-hidden />
          <span className="italic">{retreat.astroTheme}</span>
        </p>
        <p className="mt-1 text-xs text-padma-night/60 dark:text-[#d7cfc2]">{retreat.numeroTheme}</p>

        <p className="mt-4 text-xs text-padma-night/58 dark:text-[#d7cfc2]">{fmtRange(retreat.startDate, retreat.endDate)}</p>

        <Link
          href={`/reservation/${retreat.id}`}
          className={cn(
            "mt-5 inline-flex items-center gap-2 rounded-full border border-padma-lavender/40 bg-white/80 px-5 py-2.5 text-sm font-medium text-padma-night transition",
            "hover:border-padma-champagne hover:bg-padma-champagne/15 dark:border-[#c9a96e45] dark:bg-[#2a2740] dark:text-[#f5f0e8] dark:hover:bg-[#322d4a]"
          )}
        >
          Découvrir &amp; réserver
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </motion.article>
  );
}
