"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { getMajorById } from "@/lib/oracle/tarot-major";

type OracleCardTarotProps = {
  cardId: number;
  /** Libellé de position (chakra, spread…). */
  positionLabel?: string;
  index?: number;
  className?: string;
  compact?: boolean;
};

/** Carte majeure — style aquarelle doux, dégradés Padma, numéro romain discret. */
const ROMAN = ["0", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "XIV", "XV", "XVI", "XVII", "XVIII", "XIX", "XX", "XXI"];

export function OracleCardTarot({ cardId, positionLabel, index = 0, className, compact }: OracleCardTarotProps) {
  const card = getMajorById(cardId);
  const hue = (cardId * 47) % 360;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14, rotate: -1 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      transition={{ duration: 0.45, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "relative flex flex-col overflow-hidden rounded-2xl border border-white/50 shadow-soft dark:border-white/10",
        compact ? "min-h-[8.5rem] p-3" : "min-h-[11rem] p-4",
        className
      )}
      style={{
        background: `
          radial-gradient(120% 80% at 20% 15%, hsla(${hue}, 45%, 92%, 0.95) 0%, transparent 55%),
          radial-gradient(100% 90% at 85% 90%, rgba(197, 180, 212, 0.35) 0%, transparent 50%),
          linear-gradient(155deg, rgba(248, 244, 237, 0.98) 0%, rgba(232, 196, 168, 0.22) 48%, rgba(168, 180, 200, 0.18) 100%)
        `,
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.14] mix-blend-multiply dark:opacity-[0.12] dark:mix-blend-screen"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.35'/%3E%3C/svg%3E")`,
        }}
        aria-hidden
      />
      {positionLabel && (
        <p className="relative mb-2 font-display text-[0.6rem] uppercase tracking-[0.2em] text-padma-night/50 dark:text-padma-cream/55">
          {positionLabel}
        </p>
      )}
      <p className="relative font-cinzel text-lg leading-tight text-padma-night dark:text-padma-cream">{card.name}</p>
      <p className="relative mt-2 line-clamp-3 text-xs leading-relaxed text-padma-night/72 dark:text-padma-cream/78">{card.keyword}</p>
      <span className="relative mt-auto pt-3 font-display text-[0.65rem] tabular-nums text-padma-pearl/90 dark:text-padma-lavender/80">
        {ROMAN[card.id] ?? card.id}
      </span>
    </motion.div>
  );
}
