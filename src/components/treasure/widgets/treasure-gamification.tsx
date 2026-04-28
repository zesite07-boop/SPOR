"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { badgeLabel } from "@/lib/treasure/treasure-actions";
import type { TreasureGamificationState } from "@/lib/db/schema";
import { cn } from "@/lib/utils";

export function TreasureGamificationWidget({
  state,
  hyperfocus,
}: {
  state: TreasureGamificationState | null;
  hyperfocus?: boolean;
}) {
  const points = state?.energyPoints ?? 0;
  const badges = state?.badges ?? [];

  return (
    <div className={cn("space-y-4", hyperfocus && "space-y-3")}>
      <div className="flex items-center gap-3 rounded-2xl border border-padma-champagne/22 bg-gradient-to-r from-padma-champagne/18 to-padma-lavender/14 px-4 py-4 dark:from-padma-champagne/10 dark:to-padma-lavender/12">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/80 shadow-soft dark:bg-padma-night/70">
          <Sparkles className="h-6 w-6 text-padma-champagne dark:text-padma-lavender" aria-hidden />
        </div>
        <div>
          <p className="font-display text-[0.65rem] uppercase tracking-[0.2em] text-padma-pearl dark:text-padma-lavender/85">
            Points d&apos;énergie
          </p>
          <p className="font-cinzel text-3xl text-padma-night dark:text-padma-cream">{points}</p>
          <p className="text-[0.7rem] text-padma-night/58 dark:text-padma-cream/62">
            Calcul doux à partir du CA et du remplissage — purement motivationnel.
          </p>
        </div>
      </div>

      <div>
        <p className="font-cinzel text-sm tracking-wide text-padma-night dark:text-padma-cream">Badges débloqués</p>
        <ul className="mt-2 flex flex-wrap gap-2">
          {badges.length === 0 ? (
            <li className="text-sm italic text-padma-night/55 dark:text-padma-cream/58">Encore tranquille — le premier flux vous attend.</li>
          ) : (
            badges.map((id) => (
              <motion.li
                key={id}
                layout
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-full border border-padma-champagne/30 bg-white/70 px-3 py-1.5 text-xs text-padma-night shadow-sm dark:border-padma-lavender/25 dark:bg-padma-night/55 dark:text-padma-cream"
              >
                {badgeLabel(id)}
              </motion.li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
