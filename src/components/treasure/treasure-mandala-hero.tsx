"use client";

import { motion } from "framer-motion";

export function TreasureMandalaHero({
  hyperfocus,
}: {
  hyperfocus?: boolean;
}) {
  return (
    <div
      className={
        hyperfocus
          ? "relative mb-6 overflow-hidden rounded-3xl border border-padma-champagne/25 bg-gradient-to-br from-white/90 via-padma-cream/90 to-padma-lavender/15 px-5 py-6 shadow-soft dark:from-padma-night/90 dark:via-padma-night/80 dark:to-padma-lavender/10"
          : "relative mb-10 overflow-hidden rounded-[2rem] border border-padma-champagne/30 bg-gradient-to-br from-white/95 via-padma-cream/95 to-padma-pearl/20 px-6 py-10 shadow-glow dark:from-padma-night/95 dark:via-padma-night/85 dark:to-padma-lavender/15"
      }
    >
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-gradient-to-br from-padma-champagne/35 to-transparent blur-2xl dark:from-padma-champagne/15"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-gradient-to-tr from-padma-lavender/25 to-transparent blur-2xl dark:from-padma-lavender/12"
        aria-hidden
      />

      <svg
        className="pointer-events-none absolute left-1/2 top-1/2 h-[min(90vw,420px)] w-[min(90vw,420px)] -translate-x-1/2 -translate-y-1/2 opacity-[0.14] dark:opacity-[0.2]"
        viewBox="0 0 200 200"
        aria-hidden
      >
        <circle cx="100" cy="100" r="88" fill="none" stroke="currentColor" strokeWidth="0.35" className="text-padma-champagne" />
        <circle cx="100" cy="100" r="72" fill="none" stroke="currentColor" strokeWidth="0.28" className="text-padma-lavender" />
        <circle cx="100" cy="100" r="56" fill="none" stroke="currentColor" strokeWidth="0.22" className="text-padma-pearl" />
        <circle cx="100" cy="100" r="38" fill="none" stroke="currentColor" strokeWidth="0.18" className="text-padma-champagne/80" />
        {[0, 45, 90, 135].map((deg) => (
          <line
            key={deg}
            x1="100"
            y1="100"
            x2={100 + 82 * Math.cos((deg * Math.PI) / 180)}
            y2={100 + 82 * Math.sin((deg * Math.PI) / 180)}
            stroke="currentColor"
            strokeWidth="0.2"
            className="text-padma-lavender/70"
          />
        ))}
      </svg>

      <div className="relative z-10 mx-auto max-w-lg text-center">
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="font-cinzel text-[0.65rem] uppercase tracking-[0.28em] text-padma-pearl dark:text-padma-lavender/90"
        >
          Module 6 · pilotage
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="mt-3 font-cinzel text-3xl font-normal tracking-wide text-padma-night dark:text-padma-cream"
        >
          Carte du Trésor
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.55, delay: 0.12 }}
          className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-padma-night/78 dark:text-padma-cream/82"
        >
          Mandala cosmique des flux : mandats freelance, marges sensibles et scénarios — tout reste confidentiel sur cet appareil,
          synchronisation nuage à venir.
        </motion.p>
      </div>
    </div>
  );
}
