"use client";

import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

export function MarketingVeillePanel({
  bullets,
  hyperfocus,
}: {
  bullets: { tag: string; text: string }[];
  hyperfocus?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-padma-champagne/22 bg-gradient-to-br from-white/90 to-padma-lavender/12 shadow-soft dark:border-padma-lavender/18 dark:from-padma-night/55 dark:to-padma-lavender/10",
        hyperfocus && "rounded-xl"
      )}
    >
      <div className="flex items-center gap-2 border-b border-padma-champagne/15 px-4 py-3 dark:border-padma-lavender/12">
        <TrendingUp className="h-5 w-5 text-padma-champagne dark:text-padma-lavender" aria-hidden />
        <div>
          <p className="font-cinzel text-sm tracking-wide text-padma-night dark:text-padma-cream">Veille douce</p>
          <p className="text-[0.65rem] text-padma-night/55 dark:text-padma-cream/58">
            Bien-être · astrologie · numérologie — rotation locale sans réseau
          </p>
        </div>
      </div>
      <ul className="space-y-3 p-4">
        {bullets.map((b, i) => (
          <motion.li
            key={`${b.tag}-${i}`}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
            className="rounded-xl border border-padma-champagne/12 bg-white/60 px-3 py-2.5 dark:border-padma-lavender/12 dark:bg-padma-night/35"
          >
            <span className="font-display text-[0.6rem] uppercase tracking-[0.2em] text-padma-pearl dark:text-padma-lavender/85">
              {b.tag}
            </span>
            <p className="mt-1 text-sm leading-relaxed text-padma-night/88 dark:text-padma-cream/88">{b.text}</p>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
