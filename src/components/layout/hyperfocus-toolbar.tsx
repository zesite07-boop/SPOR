"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Focus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUiStore } from "@/stores/ui-store";
import { cn } from "@/lib/utils";

export function HyperfocusToolbar({ className }: { className?: string }) {
  const { hyperfocus, toggleHyperfocus } = useUiStore();

  return (
    <div className={cn("flex flex-wrap items-center gap-2 sm:gap-3", className)}>
      <Button
        type="button"
        variant={hyperfocus ? "oracle" : "secondary"}
        size="sm"
        onClick={toggleHyperfocus}
        className="touch-min min-h-11 gap-2 touch-manipulation px-5 sm:min-h-10"
        aria-pressed={hyperfocus}
        title="Raccourcis : Ctrl+Shift+H, Échap pour quitter, Alt+1..6 pour naviguer"
      >
        <Focus className="h-4 w-4 shrink-0" aria-hidden />
        <span className="font-cinzel text-xs tracking-wide">Hyperfocus</span>
      </Button>
      <span className="hidden text-[0.65rem] text-padma-night/48 md:inline">
        Ctrl+Shift+H · Alt+1..6
      </span>
      <AnimatePresence>
        {hyperfocus && (
          <motion.span
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="max-w-[min(100%,18rem)] text-xs leading-snug text-padma-pearl"
          >
            Une seule colonne, moins de bruit visuel et plus de respiration - ideal pour cerveau sensible ou TDAH.
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}
