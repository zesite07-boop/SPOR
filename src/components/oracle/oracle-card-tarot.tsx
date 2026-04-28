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
  revealed?: boolean;
};

/** Carte majeure — style aquarelle doux, dégradés Padma, numéro romain discret. */
const ROMAN = ["0", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "XIV", "XV", "XVI", "XVII", "XVIII", "XIX", "XX", "XXI"];

export function OracleCardTarot({ cardId, positionLabel, index = 0, className, compact, revealed = true }: OracleCardTarotProps) {
  const card = getMajorById(cardId);
  const hue = (cardId * 41) % 360;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, rotateY: 90, rotate: -1 }}
      animate={{ opacity: 1, y: 0, rotateY: 0, rotate: 0 }}
      transition={{ duration: 0.58, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "relative flex flex-col overflow-hidden rounded-2xl border border-white/50 shadow-soft",
        compact ? "min-h-[8.5rem] p-3" : "min-h-[11rem] p-4",
        className
      )}
    >
      <motion.div
        className="pointer-events-none absolute -inset-2 rounded-[1.2rem] bg-[radial-gradient(circle,rgba(201,169,110,0.26)_0%,transparent_68%)]"
        animate={revealed ? { opacity: [0.35, 0.7, 0.35] } : { opacity: 0 }}
        transition={{ duration: 1.8, repeat: Infinity }}
        aria-hidden
      />
      {revealed ? (
        <>
          <svg viewBox="0 0 320 480" className="absolute inset-0 h-full w-full" aria-hidden>
            <defs>
              <linearGradient id={`wash-${cardId}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={`hsl(${hue} 55% 88%)`} />
                <stop offset="48%" stopColor="#f0dfc6" />
                <stop offset="100%" stopColor="#d8dff0" />
              </linearGradient>
            </defs>
            <rect x="10" y="10" width="300" height="460" rx="28" fill={`url(#wash-${cardId})`} />
            <rect x="16" y="16" width="288" height="448" rx="24" fill="none" stroke="#c9a96e88" />
          </svg>
          {positionLabel && (
            <p className="relative mb-2 font-display text-[0.6rem] uppercase tracking-[0.2em] text-padma-night/58">
              {positionLabel}
            </p>
          )}
          <span className="relative font-cinzel text-sm tracking-[0.08em] text-[#c9a96e]">{ROMAN[card.id] ?? card.id}</span>
          <p className="relative mt-1 font-cinzel text-lg leading-tight text-padma-night">{card.name}</p>
          <p className="relative mt-auto line-clamp-3 text-xs leading-relaxed text-padma-night/72">{card.keyword}</p>
        </>
      ) : (
        <div className="relative flex h-full w-full flex-col items-center justify-center rounded-2xl bg-[#11182f] text-padma-cream">
          <div className="absolute inset-0 opacity-20" aria-hidden>
            <svg viewBox="0 0 120 120" className="h-full w-full">
              <path d="M60 18 70 44 98 44 75 62 84 88 60 72 36 88 45 62 22 44 50 44z" fill="#c9a96e" />
            </svg>
          </div>
          <p className="font-cinzel text-sm tracking-[0.09em]">Serey Padma</p>
        </div>
      )}
    </motion.div>
  );
}
