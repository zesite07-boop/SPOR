"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function ChecklistItem({
  label,
  done,
  onToggle,
  compact,
}: {
  label: string;
  done: boolean;
  onToggle: () => void;
  compact?: boolean;
}) {
  return (
    <motion.button
      type="button"
      layout
      initial={false}
      animate={{ opacity: 1 }}
      onClick={onToggle}
      className={cn(
        "flex w-full items-start gap-3 rounded-xl border px-3 py-2.5 text-left transition",
        done
          ? "border-padma-champagne/35 bg-padma-champagne/10 text-padma-night/55 line-through"
          : "border-padma-pearl/35 bg-white/75 hover:border-padma-lavender/45",
        compact && "py-2"
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
          done ? "border-padma-champagne bg-padma-champagne/40" : "border-padma-pearl"
        )}
      >
        {done && <Check className="h-3 w-3 text-padma-night" aria-hidden />}
      </span>
      <span className={cn("text-sm leading-snug text-padma-night", done && "line-through")}>{label}</span>
    </motion.button>
  );
}
