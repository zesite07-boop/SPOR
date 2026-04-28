"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useUiStore } from "@/stores/ui-store";

/** Toast doux en bas d’écran — succès copie / synchro locale. */
export function CelebrationPulse() {
  const celebration = useUiStore((s) => s.celebration);

  return (
    <AnimatePresence>
      {celebration ? (
        <motion.div
          key={celebration}
          role="status"
          aria-live="polite"
          initial={{ opacity: 0, y: 14, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ type: "spring", stiffness: 420, damping: 28 }}
          className="pointer-events-none fixed bottom-24 left-1/2 z-[60] flex max-w-sm -translate-x-1/2 items-center gap-2 rounded-full border border-padma-champagne/35 bg-padma-cream/95 px-5 py-3 text-sm text-padma-night shadow-glow backdrop-blur-md dark:border-padma-lavender/40 dark:bg-padma-night/92 dark:text-padma-cream md:bottom-8"
        >
          <motion.span
            animate={{ rotate: [0, 12, -8, 0] }}
            transition={{ duration: 0.55 }}
            className="inline-flex text-padma-champagne dark:text-padma-lavender"
          >
            <Sparkles className="h-4 w-4 shrink-0" aria-hidden />
          </motion.span>
          <span className="font-display text-[0.9rem] leading-snug">{celebration}</span>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
